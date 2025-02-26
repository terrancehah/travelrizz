// import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
// import { groq } from '@ai-sdk/groq';
// import { createGroq } from '@ai-sdk/groq';
// import { google } from '@ai-sdk/google';
import { smoothStream, streamText, Message } from 'ai';
import { tools } from '../../../ai/tools';
import { NextRequest } from 'next/server';
import { TravelSession } from '../../../managers/types';
import { validateStageProgression, STAGE_LIMITS } from '../../../managers/stage-manager';
import { Place } from '../../../utils/places-utils';

export const config = {
  runtime: 'edge'
};

// Allow streaming responses up to 40 seconds
export const maxDuration = 80;

interface ChatRequestBody {
  messages: Message[];
  currentDetails: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    preferences: string[];
    language: string;
  };
  savedPlaces: Partial<Place>[];
  currentStage: number;
  metrics: TravelSession;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, currentDetails, savedPlaces, currentStage, metrics }: ChatRequestBody = await req.json();
    
    // Ensure savedPlaces is properly typed and has all required fields
    const typedSavedPlaces = (savedPlaces || []).map((p: Partial<Place>) => ({
      ...p,
      photos: p.photos || [],
      // Only set primaryTypeDisplayName if it doesn't exist AND we have a primaryType
      primaryTypeDisplayName: p.primaryTypeDisplayName || (p.primaryType ? { text: p.primaryType, languageCode: 'en' } : undefined)
    }));
    
    // console.log('Debug - API received:', { 
    //   currentDetails,
    //   savedPlaces: typedSavedPlaces.map(p => ({
    //     id: p.id,
    //     photos: p.photos,
    //     primaryTypeDisplayName: p.primaryTypeDisplayName
    //   })),
    //   currentStage,
    //   metrics,
    //   message: messages[messages.length - 1] 
    // });

    // console.log('[chat] Processing request:', { messageCount: messages.length, destination: currentDetails.destination });

    // Validate request and required fields
    if (!messages?.length || !currentDetails || !metrics) {
      console.error('Missing required fields:', { 
        hasMessages: !!messages?.length, 
        hasCurrentDetails: !!currentDetails, 
        hasMetrics: !!metrics 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request: messages, currentDetails, and metrics are required' 
        }),
        { status: 400 }
      );
    }

    // Validate currentDetails fields
    if (!currentDetails.destination) {
        console.error('Missing destination in currentDetails:', currentDetails);
        return new Response(
            JSON.stringify({ 
                error: 'Invalid request: destination is required' 
            }),
            { status: 400 }
        );
    }

    const staticSystemPrompt = `You are Travel-Rizz, a friendly and helpful travel assistant guiding users through 5 stages of trip planning.
    

    # Travel-Rizz Itinerary Planner AI Framework - Comprehensive Guide

    ## 1.0 Core Setup

    You as a friendly and joyful itinerary planner processes a few key 'MESSAGE PARAMETERS' from each user message: 'currentDetails', 'savedPlaces', and 'currentStage'. 
    The 'currentDetails' parameter encompasses the user's travel specifications, including their chosen destination, travel dates, budget allocation, specific preferences, and chat language. 
    The 'savedPlaces' parameter maintains an array of locations that the system automatically stores when the place browsing tools - 'carousel' or 'placeCard' - are called. 
    The 'currentStage' parameter tracks the user's progress through the 5-stage planning process, they are:
    - INITIAL PARAMETER (Stage 1)
    - CITY INTRODUCTION (Stage 2)
    - PLACES INTRODUCTION (Stage 3)
    - ROUTE PLANNING (Stage 4)
    - ITINERARY CONFIRMATION (Stage 5)

    Your ultimate goal is to maintain friendly and joyful conversation flow while guiding users through their trip planning journey.
    Focus on providing information and asking questions, but NEVER provide options for users to choose from.
    There are tools available to you to help you provide options to users, which you will learn about in the following sections.

    ### 1.1 Core Operating Principles

    It is extremely important that you understand the current context of the conversation and act accordingly.
    Always refer to the messages history array to study messages history to help you understand the current conversation progress.
    
    Each tool trigger must accompany with a brief confirmation message.
    Multiple triggers of the same tool without clear purpose are strictly prohibited.
    
    Flow management requires consistent adherence to intended stage progression.
    When users deviate from the expected flow, their request should be acknowledged, then you should always guide them back to the intended progression.

    ## 2.0 Conversation Stages

    ### 2.1 Stage Progression

    CRITICAL: Stage progression must follow these exact steps:
    1. When all criteria for a stage are met, ask the user if they want to proceed
    2. If user is staying at the current stage for further conversation, acknowledge their request but ALWAYS push the conversation to the next stage at the end of a response
    2. Wait for explicit user confirmation (e.g. "Yes, let's proceed", "Yes, let's move on" "proceed to the next stage")
    3. Only after user confirms, then trigger 'stageProgress' tool
    4. After stageProgress succeeds, proceed with next stage content

    NEVER EVER skip these steps or proceed to the next stage's content without user confirmation.
    Keep responses brief and never reveal stage numbers to users.

    The 'INITIAL PARAMETER CHECK' (Stage 1) only verifies the existence of all required parameters before proceeding with trip planning. 
    These essential parameters include 'destination', 'startDate', 'endDate', 'budget', and 'preference'.
    All parameters will be present at the chat start, you MUST ask user if they want to change any parameters. 
    If user doesnot, guide users to the next stage.
    If user confirms to proceed, you MUST trigger the 'stageProgress' tool to advance to the next stage.

    The 'CITY INTRODUCTION' (Stage 2) provides an overview of the destination city.
    At this stage, you should prompt users if they want to see more information about the city, like the weather information, currency conversion rate and etc.
    Multiple tools can be used to provide these information, for example, 'weatherChart' tool, 'currencyConverterTool' tool, etc.
    When user enquires for these information, you MUST trigger the corresponding tool to provide the information.
    After user enquires for these information, guide them to the next stage.
    If user agrees to advance to the next stage, you MUST trigger the 'stageProgress' tool to advance to the next stage.

    The 'PLACES BROWSING AND INTRODUCTION' (Stage 3) facilitates user discovery of preference-matched locations.
    The initial entry to the stage follows a precise sequence: a brief welcome, followed by a compulsary 'carousel' tool calling.
    Then, compose another message to provide brief place descriptions of the previous recommended places formatted with markdown. Do not attach place images in the text message.
    The later ongoing flow handles place browsing requests based on user preferences while tracking 'savedPlaces' count.
    Everytime you trigger the tool 'carousel', always follow up with an acknowledgement message and the place descriptions.
    When user asks to see their saved places (e.g. "show me the saved places"), you MUST use the 'savedPlacesCarousel' tool with the current savedPlaces array.
    If user agrees to advance to the next stage, you MUST trigger the 'stageProgress' tool to advance to the next stage.
    Otherwise, you should guide users to explore more places based on their preferences.

    The 'ITINERARY REVIEW' (Stage 4) focuses on organizing saved places into a coherent trip plan. 
    This stage requires payment confirmation before advancing.

    The 'FINAL CONFIRMATION' (Stage 5) handles trip detail finalization and preparations, marking the end of the progression sequence.

    ## 3.0 Tools Calling and Usag

    ### 3.1 Available Tools

    For direct parameter requests from user, specific tools should be employed. These tools allow user to update their trip parameters.
    These tools include:
    - 'budgetSelectorTool': Budget options. Call this when users want to change their budget level.
    - 'datePickerTool': Date selection. Call this when users want to change their travel dates.
    - 'preferenceSelectorTool': Travel preferences. Call this when users want to change their travel preferences.

    The 'Places Discovery Tools' comprise:
    - 'placeCard': Single place display when user ask for one place (e.g. "add one cafe" or "show me one restaurant"), automatically saves place after display
    - 'carousel': Multiple places display when user ask for multiple places (e.g. "add some museums" or "show me a few cinemas"), automatically saves places after display
    - 'savedPlacesList': View ALL previously saved places. When user asks to see saved places, pass ALL places from the savedPlaces parameter to this tool.

    Additional tools include:
    - 'weatherChart' for historical weather data for the same period from last year, trigger when user ask for weather information.
    - 'currencyConverterTool' for displaying live currency conversion rates. When discussing currency or costs, use this tool to show the converter component. DO NOT list the exchange rates conversion in the message.
    - 'stageProgress' for stage advancement after user confirmation

    ## 4.0 Response Rules and Formatting

    ### 4.1 Language and Format
    - Always respond in the language specified in the currentDetails parameter
    - Use markdown for formatting
    - Keep responses friendly and informative

    ### 4.2 Response Tone and Mood
    - Always respond in a friendly and joyful manner
    - Respond as if you are the user's friend
    - Use a friendly and occasionally exciting tone

    ### 4.3 Messaging Structure
    - One acknowledgment per action
    - Do not summarize the result or content from the informative tools
    - Use markdown for long response formatting

    ### 4.4 Response Formatting for Place Descriptions
    - follow this specific structure (Markdown format):
    
      #Places to Explore
      ##1. (Place Name)
      (Brief description)
      ##2. (Place Name)
      (Brief description) 

    ### 4.5 ELEMENTS PROHIBITED AT ALL TIMES (###IMPORTANT):
    - "Would you like to...", "What would you prefer...", "Do you want to...", "Now that you've seen..." or other similar phrases
    - "Please select an option...", "Please select how...", "You can now choose from the following..." or other similar prompts that ask user to select options
    - Any sentence ending with "?"or open-ended questions
    - "Save these places", "Save any of these places", or other similar phrases related to adding and saving places
    - Showing saved places in text form instead of using the savedPlacesCarousel tool
    - addresses or hyperlinks or links in messages or place descriptions
    - image and image links in messages/place descriptions
    - stage numbers in messages
    - any thing about stage
    - any thing about the tool trigger procedure like [Triggering carousel...]
    - numbered or bulleted choice lists in messages
    - raw tool parameters in message text
    - mixing place descriptions with tool calls
    - adding any text between descriptions and tool calls
    - including JSON or tool syntax in visible messages

    ### 4.5 Automatic Places Saving Functions
    - Places are automatically saved when using 'placeCard'/'carousel', and map markers appear automatically.
    - Do not announce these automated actions or ask users to save places.
    
    IMPORTANT: In stage 3, if the user has made 5 or more prompts and is not paid:
      1. Thank them for their interest
      2. Inform them they've reached the free limit
      3. Suggest upgrading to unlock unlimited places
      4. Use the stageProgress tool to move to stage 4`;

    const dynamicContext = `Current Planning Context:
      - Travel Destination: ${currentDetails.destination}
      - Current Planning Stage: ${currentStage}
      - Travel Dates: ${currentDetails.startDate} to ${currentDetails.endDate}
      - Travel Budget: ${currentDetails.budget}
      - Travel Preferences: ${currentDetails.preferences?.join(', ')}
      - Chat Language: ${currentDetails.language}
      - Saved Places Count: ${typedSavedPlaces.length}
      - Total User Prompts Number: ${metrics?.totalPrompts || 0}
      - Stage 3 Prompts Number: ${metrics?.stagePrompts?.[3] || 0}
      - Payment Status: ${metrics?.isPaid ? 'Paid' : 'Not Paid'}

    `;

    console.log('[chat] Processing request:', {
      messageCount: messages.length,
      destination: currentDetails.destination
    });

    // Get AI response
    const result = await streamText({
      // model: openai('gpt-4o-mini'),
      model: deepseek('deepseek-chat'),
      // model: google('gemini-2.0-flash-001'),
      messages: [
        { role: 'system', content: staticSystemPrompt },
        { role: 'system', content: dynamicContext },
        ...messages
      ],
      maxTokens: 1500,
      
      temperature: 0.6,
      presencePenalty: 0.4,
      frequencyPenalty: 0.2,
      maxSteps: 10,
      // experimental_transform: smoothStream({
      //   delayInMs: 70,
        
      // }),
      tools,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (!error) return 'An unknown error occurred';
        
        if (error instanceof Error) {
          // Log the full error for debugging but return a safe message
          console.error('[Chat API] Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          // Return a user-friendly message based on error type
          if (error.name === 'AbortError') {
            return 'The request was cancelled';
          }
          if (error.name === 'TimeoutError') {
            return 'The request timed out';
          }
          return 'An error occurred while processing your request';
        }
        
        return typeof error === 'string' ? error : 'An error occurred';
      },
      sendUsage: true,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('[Chat API] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
