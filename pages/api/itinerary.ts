import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText, tool, Output } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cityInfoTool, travelDetailsTool, travelRemindersTool, emergencyContactsTool, dailyItineraryTool } from '../../ai/itinerary-tools';

export const config = {
    runtime: 'edge'
};

interface ItineraryRequestBody {
    destination: string;
    startDate: string;
    endDate: string;
    preferences: string[];
}

// Define the expected output schema matching our tool schemas
const itinerarySchema = z.object({
    cityInfo: z.object({
        intro: z.string(),
        weather: z.string(),
        language: z.string(),
        population: z.string(),
        weatherForecast: z.array(z.object({
            day: z.string(),
            temp: z.number(),
            high: z.number(),
            low: z.number(),
            icon: z.string()
        }))
    }),
    travelDetails: z.object({
        currency: z.string(),
        safety: z.string(),
        businessHours: z.string(),
        navigation: z.string(),
        localTips: z.string()
    }),
    travelReminders: z.object({
        documents: z.string(),
        taxRefund: z.string(),
        etiquette: z.string(),
        health: z.string()
    }),
    emergencyContacts: z.object({
        emergency: z.string(),
        hospitals: z.array(z.object({
            name: z.string(),
            address: z.string(),
            phone: z.string(),
            notes: z.string()
        })),
        embassy: z.string()
    }),
    dailyItinerary: z.object({
        schedule: z.array(z.object({
            day: z.number(),
            date: z.string(),
            schedule: z.array(z.object({
                time: z.enum(['Morning', 'Afternoon', 'Evening']),
                activities: z.array(z.object({
                    name: z.string(),
                    description: z.string()
                }))
            }))
        }))
    })
});

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const body: ItineraryRequestBody = await req.json();
        const { destination, startDate, endDate, preferences } = body;

        if (!destination || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }
        
        const result = await generateText({
            model: openai('gpt-4o', { structuredOutputs: true }),
            prompt: `
            Generate a complete travel itinerary for ${destination} from ${startDate} to ${endDate}.
            Consider these preferences: ${preferences.join(', ')}.
            Include all necessary information:
            1. City information and weather forecast
            2. Travel details and local tips
            3. Important reminders and etiquette
            4. Emergency contacts and hospitals
            5. Daily schedule with activities
            
            Ensure all data is accurate and properly formatted.
            `,
            tools: {
                cityInfoTool,
                travelDetailsTool,
                travelRemindersTool,
                emergencyContactsTool,
                dailyItineraryTool
            },
            experimental_output: Output.object({
                schema: itinerarySchema
            }),
            maxSteps: 5
        });

        // Parse the JSON string from the text field if needed
        const data = typeof result.text === 'string' ? JSON.parse(result.text) : result;
        
        // The result will be automatically validated against our schema
        return NextResponse.json({ success: true, data });
        
    } catch (error) {
        console.error('Error generating itinerary data:', error);
        return NextResponse.json({ 
            error: 'Failed to generate itinerary data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}