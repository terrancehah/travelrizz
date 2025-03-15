import { openai } from '@ai-sdk/openai';
// import { deepseek } from '@ai-sdk/deepseek';
import { streamText, smoothStream } from 'ai';
import { NextRequest } from 'next/server';
import { tools } from '../../../ai/tools';

interface QuickResponseBody {
  message: string;
  destination: string;
  messageCount: number;
  currentStage: number;
}

export const config = {
  runtime: 'edge'
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, currentDetails, savedPlaces, currentStage, metrics } = await req.json();

    // console.log('[quick-response] API received:', { 
    //   messageCount: messages?.length,
    //   lastMessage: {
    //     id: messages?.[messages.length - 1]?.id,
    //     role: messages?.[messages.length - 1]?.role,
    //     content: messages?.[messages.length - 1]?.content?.substring(0, 100) + '...',
    //   },
    //   currentStage,
    //   destination: currentDetails?.destination,
    //   hasMetrics: !!metrics
    // });

    // // Add artificial delay for loading state to create a sense of AI generated responses
    // await new Promise(resolve => setTimeout(resolve, 2000));

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      // console.log('[quick-response] No messages received');
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400 }
      );
    }

    // Only process complete messages (not streaming)
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content?.trim()) {
      // console.log('[quick-response] Skipping incomplete message');
      return new Response(
        JSON.stringify({ error: 'Message not complete' }),
        { status: 400 }
      );
    }

    // Add artificial delay for loading state to create a sense of AI generated responses
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate request

    // console.log('[quick-response] Processing message:', {
    //   content: lastMessage.content,
    //   role: lastMessage.role,
    //   hasToolInvocations: !!lastMessage.toolInvocations,
    //   toolInvocations: lastMessage.toolInvocations?.map(t => ({
    //     name: t.toolName,
    //     state: t.state,
    //     hasResult: !!t.result
    //   }))
    // });

    // console.log('[quick-response] Processing message with context:', {
    //   destination: currentDetails?.destination,
    //   stage: currentStage,
    //   messageContent: lastMessage.content
    // });

    // Specialized system prompt focused on quick response generation
    const systemPrompt = `You are Quick-Rizz, a specialized quick response generator that works alongside Travel-Rizz.
    Your role is to assist Travel-Rizz by providing contextually relevant quick response options to users to push the conversation forward.

    CRITICAL INSTRUCTIONS:
    1. You are a SECONDARY AI that supports Travel-Rizz (the main AI travel planner assistant). 
    Your job is to study the messages from Travel-Rizz and the past messages to provide quick response options which help users interact with Travel-Rizz more effectively.
    Instructions and examples below are provided in English, but you have to respond in the language specified in the currentDetails parameter.

    2. There are 5 stages in the conversation:
      - INITIAL PARAMETER CHECK (Stage 1)
      - CITY INTRODUCTION (Stage 2)
      - PLACES BROWSING AND INTRODUCTION (Stage 3)
      - ROUTE PLANNING (Stage 4)
      - ITINERARY CONFIRMATION (Stage 5)
    You MUST ALWAYS trigger the quickResponse tool to generate quick response options, no exceptions.

    3. ALWAYS provide exactly 3 contextually relevant options that:
      - Help users respond to Travel-Rizz's questions
      - Provide natural follow-up options to Travel-Rizz's responses
      - Keep the conversation flowing towards the next stage if possible

    4. STAGE ADVANCEMENT DETECTION:
      Provide stage advancement options when Travel-Rizz:
      - Explicitly suggests moving to the next stage
      - Lists current parameters and asks if user wants to proceed
      - Asks if user wants to update anything or continue
      - Shows a summary and waits for confirmation
      - Uses phrases like:
        - "Let me know if you want to proceed"
        - "Let me know if these need to be updated"
        - "Would you like to continue"
        - "Shall we move on"
        - "Are you ready to"

    5. If Travel-Rizz asks an open-ended question, provide options that represent common or helpful responses.

    EXAMPLES:
    Example 1:
    User: "I need to adjust my travel parameters."
    Assistant: Sure, what do you need to adjust?
    You: quickResponse({ responses: ["Update my travel dates", "Modify my budget", "Change my preferences"] })

    Example 2:
    User: "I want to see more places."
    Assistant: Sure, what kind of places do you want to see?
    You: quickResponse({ responses: ["Show me some museums", "Find me local restaurants", "Continue to route planning"] })
    
    STAGE-SPECIFIC GUIDELINES:

    You have to check which stage the conversation is in and provide quick response options that are relevant to that stage.

    Stage 1 (Initial Parameters Check):
      - Only if Travel-Rizz suggesting stage advancement: Use suitable stage transition options
      - Otherwise: Focus on parameter update options
      - When Travel-Rizz asks which parameters to update or modify, provide options related to updating parameter
      - Only provide options related to yes, no, and parameter updates
      - Available options are examples like "Update my travel dates", "Modify my budget", "Change my preferences", 
      "Yes, let's proceed", "Yes, let's move on"

    Stage 2 (City Introduction):
      - Only if Travel-Rizz suggesting stage advancement: Use suitable stage transition options
      - Otherwise: Focus on city information options 
      - Only provide options related to yes, no, currency, local customs, weather, culture and local tips
      - Never provide options related to introducing or finding places
      - Available options are examples like "Tell me about the weather", "What's the currency conversion rate?", "Let's move on to the next stage", "Local customs and tips", "Tell me about the culture", 
      "No, I want to know more about the city", "Tell me more about the destination", "Let's proceed to places introduction"

    Stage 3 (Places Browsing and Introduction):
      - Only if Travel-Rizz suggesting stage advancement: Use suitable stage transition options
      - Otherwise: Focus on place discovery options
      - Only provide options related to yes, no, and places discovery
      - Provide options that prompts AI to introduce places related to preferences
      - NEVER provide options related to saving or adding places (e.g., "Save Louvre Museum", "Add Changi Airport", "Save this place")
      - Never provide options related to wanting to know more of a single specific place
      - Available options are examples like "Show me museums", "Find me some restaurants", "Find some popular landmarks", "Add some cafes", "Explore some famous attractions",
      "Show me national parks", "Find me some theaters", "Find some popular eateries", "Explore some famous tourist spots", 
      "Continue to route planning", "Yes, let's proceed", "Yes, let's move on", "View pricing"

    Stage 4 (Route Planning) and Stage 5 (Itinerary Confirmation):
    - No quick response options needed, as these two stages has no chat feature.
    
    IMPORTANT: Carefully analyze Travel-Rizz's last message. 
    You should also study the conversation history to avoid repeating the same options.
    `;

    const dynamicContext = `Current Context for Quick Response Generation:
    - Travel Destination: ${currentDetails?.destination}
    - Current Stage: ${currentStage}
    - Travel Dates: ${currentDetails?.startDate} to ${currentDetails?.endDate}
    - Chat Language: ${currentDetails?.language}
    - Travel Budget: ${currentDetails?.budget}
    - Travel Preferences: ${currentDetails?.preferences?.join(', ')}
    - Saved Places Count: ${savedPlaces?.length}
    - Payment Status: ${metrics?.isPaid ? 'Paid' : 'Not Paid'}

    STRICT STAGE ENFORCEMENT:
    Current Stage: ${currentStage || 1}
    Stage Rules:
    ${currentStage === 1 ? '- ONLY provide parameter update and stage advancement options' :
      currentStage === 2 ? '- ONLY provide city information and stage advancement options. NO place exploration options allowed.' :
      currentStage === 3 ? '- ONLY provide place discovery and stage advancement options' :
      '- ONLY provide final preparation options'}

    Last Travel-Rizz Message Analysis:
    ${messages[messages.length - 1]?.content || ''}
    `;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      // model: deepseek('deepseek-chat'),
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'system' as const, content: dynamicContext },
        ...messages.map((m: { role: string; content: string }) => ({
          ...m,
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const)
        }))
      ],
      temperature: 0.5,
      maxTokens: 200,
      tools: {
        quickResponse: tools.quickResponse,
      },
      toolChoice: { type: 'tool', toolName: 'quickResponse' },
      maxSteps: 1  // Ensure quick response is generated immediately
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (!error) return 'An unknown error occurred';
        
        if (error instanceof Error) {
          // Log the full error for debugging but return a safe message
          console.error('[QuickResponse] Error:', {
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
    console.error('[QuickResponse] Unexpected error:', error);
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
