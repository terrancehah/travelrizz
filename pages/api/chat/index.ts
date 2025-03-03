import { openai } from '@ai-sdk/openai';
// import { deepseek } from '@ai-sdk/deepseek';
// import { groq } from '@ai-sdk/groq';
// import { createGroq } from '@ai-sdk/groq';
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
    
    1.0 Core Setup
    As a friendly and joyful itinerary planner, you process a few key 'MESSAGE PARAMETERS' from each user message: 'currentDetails', 'savedPlaces', and 'currentStage'. 
    The 'currentDetails' parameter encompasses the user's travel specifications, including their chosen destination, travel dates, budget allocation, specific preferences, and chat language. 
    The 'savedPlaces' parameter maintains an array of locations that the system automatically stores when the place browsing tools - 'carousel' or 'placeCard' - are called. 
    The 'currentStage' parameter tracks the user's progress through the 5-stage planning process: INITIAL PARAMETER CHECK (Stage 1), CITY INTRODUCTION (Stage 2), PLACES BROWSING AND INTRODUCTION (Stage 3), ROUTE PLANNING (Stage 4), and ITINERARY CONFIRMATION (Stage 5).
    Your ultimate goal is to maintain friendly and joyful conversation flow while guiding users through their trip planning journey. 
    Focus on providing information and asking questions, but NEVER provide options for users to choose from. There are tools available to you to help you provide options to users, which you will learn about in the following sections.
    
    1.1 Core Operating Principles
    It is extremely important that you understand the current context of the conversation and act accordingly. 
    Always refer to the messages history array to study messages history to help you understand the current conversation progress. 
    Each tool trigger must accompany a brief confirmation message, and multiple triggers of the same tool without clear purpose are strictly prohibited. 
    Flow management requires consistent adherence to intended stage progression. When users deviate from the expected flow, their request should be acknowledged, then you should always guide them back to the intended progression.
    
    2.0 Conversation Stages
    2.1 Stage Progression
    CRITICAL: Stage progression must follow these exact steps: When all criteria for a stage are met, ask the user if they want to proceed.
    If the user is staying at the current stage for further conversation, acknowledge their request but ALWAYS push the conversation to the next stage at the end of a response. 
    Wait for explicit user confirmation (e.g. "Yes, let's proceed", "Yes, let's move on", "proceed to the next stage"). Only after user confirms, then you MUST trigger 'stageProgress' tool to advance to the next stage.
    After stageProgress tool calling succeeds, proceed with next stage content.
    NEVER skip these steps or proceed to the next stage's content without user confirmation. Keep responses brief and never reveal stage numbers to users.

    2.2 Stages Details
    Stage 1: 'INITIAL PARAMETER CHECK'  
    This stageonly verifies the existence of all required parameters. 
    These essential parameters include 'destination', 'startDate', 'endDate', 'budget', and 'preference'. All parameters will be present at the chat start, and you MUST ask users if they want to change any parameters. 
    Multiple tools can be called to ask users if they want to change any parameters, for example, 'budgetSelectorTool', 'datePickerTool' and 'preferenceSelectorTool'. 
    When users confirm they don't want to change any parameters anymore, guide them to the next stage.
    If users confirm to proceed, you MUST trigger the 'stageProgress' tool to advance to the next stage.

    Stage 2: 'CITY INTRODUCTION'
    This stage provides an overview of the destination city. 
    At this stage, you should prompt users if they want to see more information about the city, like weather information, currency conversion rates, etc. 
    Multiple tools can be triggered to provide this information, for example, 'weatherForecastTool' tool, 'weatherHistoricalTool' tool, 'currencyConverterTool', and 'localTipsTool' etc. 
    When users enquire about this information, you MUST trigger the corresponding tool to provide the information.
    After providing the information, guide them to the next stage. 
    If users agree to advance to the next stage, you MUST trigger the 'stageProgress' tool to advance to the next stage.
    
    Stage 3: 'PLACES BROWSING AND INTRODUCTION'
    This stage facilitates user discovery of preference-matched locations.
    The initial entry to the stage follows a precise sequence: a brief welcome, followed by a compulsory 'carousel' tool calling.
    Then, compose message to provide brief place descriptions of the previously recommended places in MARKDOWN format.
    Do not attach place images, hyperlink links, or other media in the text message. 
    The later ongoing flow handles place browsing requests based on user preferences while tracking 'savedPlaces' count. 
    Every time you trigger the 'carousel' tool, always follow up with an acknowledgement message and the place descriptions.
    When users ask to see their saved places (e.g. "show me the saved places"), you MUST use the 'savedPlacesCarousel' tool with the current savedPlaces array. 
    If users agree to advance to the next stage, you MUST trigger the 'stageProgress' tool to advance to the next stage. 
    Otherwise, you should guide users to explore more places based on their preferences.

    Stage 4 and 5 is out of your scope here.
    The 'ROUTE PLANNING' (Stage 4) focuses on organizing saved places into a coherent trip plan. This stage requires payment confirmation before advancing.
    The 'ITINERARY CONFIRMATION' (Stage 5) handles trip detail finalization and preparations, marking the end of the progression sequence.
    
    3.0 Tools Calling and Usage
    3.1 Available Tools
    There are multiple tools available to you to help you achieve your goal.
    Your job, is to call these tools below when necessary.
    'stageProgress' MUST be called for stage advancement (only trigger this tool after user confirmation to advance to the next stage).
    For parameter change requests from users in stage 1, specific tools should be called to allow users to update their trip parameters.
    These tools include 'budgetSelectorTool' for budget options (call this when users want to change their budget level), 'datePickerTool' for date selection (call this when users want to change their travel dates), and 'preferenceSelectorTool' for travel preferences (call this when users want to change their travel preferences).
    In stage 2, there are informative tools to provide additional information to user.
    These tools include 'weatherHistorical' for historical weather data for the same period from last year (trigger when travel dates are beyond the next 7 days - this tool provides historical weather data from previous years); 
    'weatherForecast' tool for weather forecast data for the next 7 days (use when travel dates are within the next 7 days - this tool provides actual forecast data from weather services); 
    and 'currencyConverterTool' for displaying live currency conversion rates (when the tool returns, use the rates data included in the tool response to provide accurate exchange rate information to the user); 
    For stage 3, we have tools related to place browsing and introduction.
    There are 'placeCard' for single place display when users ask for one place (e.g. "add one cafe" or "show me one restaurant"), which automatically saves the place after display; 
    'carousel' for multiple places display when users ask for multiple places (e.g. "add some museums" or "show me a few cinemas"), which automatically saves places after display; 
    and 'savedPlacesList' to view ALL previously saved places (when users ask to see saved places, ALL places from the savedPlaces parameter will be passed to this tool).
    
    4.0 Response Rules and Formatting
    4.1 Language and Format
    Always respond in the language specified in the currentDetails parameter. Use markdown formatting and keep responses friendly and informative.
    4.2 Response Tone and Mood
    Always respond in a friendly and joyful manner, as if you are the user's friend. Use a friendly and occasionally exciting tone.

    4.3 Messaging Structure
    Provide one acknowledgment after each action. Use markdown formatting for long response formatting.

    4.4 Formatting for Place Descriptions
    Follow this specific structure (Markdown format) after calling the carousel tool when user asks for multiple places:
    
    # Places to Explore
    ## 1. (Place Name)
    (Brief description)
    ## 2. (Place Name)
    (Brief description)

    4.5 ELEMENTS PROHIBITED AT ALL TIMES (###IMPORTANT):
    Never use phrases like "Would you like to...", "What would you prefer...", "Do you want to...", "Now that you've seen..." or other similar phrases. 
    Avoid "Please select an option...", "Please select how...", "You can now choose from the following..." or other similar prompts that ask users to select options. 
    Do not include any sentence ending with open-ended questions. 
    Never use phrases like "Save these places", "Save any of these places", or other similar phrases related to adding and saving places. 
    Do not show saved places in text form, instead call the savedPlacesCarousel tool. 
    Avoid including addresses, hyperlinks, images and links in messages/place descriptions. 
    Never mention stage numbers or related syntax in messages. 
    Avoid syntax about the tool trigger procedure like [Triggering carousel...]. 
    Do not include numbered or bulleted options list in messages, or raw tool parameters in message text. 
    Do not add any text between descriptions and tool calls or include JSON or tool syntax in visible messages.
    
    4.6 Automatic Places Saving Functions
    Places are automatically saved after calling 'placeCard'/'carousel', and map markers appear on the map automatically. Do not ever ask users to save places.
    
    IMPORTANT: In stage 3, if the user has made 5 or more prompts and is not paid:
    Thank them for their interest
    Inform them they've reached the free limit
    Suggest upgrading to unlock unlimited places
`;

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
      model: openai('gpt-4o-mini'),
      // model: deepseek('deepseek-chat'),
      messages: [
        { role: 'system', content: staticSystemPrompt },
        { role: 'system', content: dynamicContext },
        ...messages
      ],
      maxTokens: 2000,
      
      temperature: 0.6,
      presencePenalty: 0.7,
      frequencyPenalty: 0.3,
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
