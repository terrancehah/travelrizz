import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText, tool, Output } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cityInfoTool, travelDetailsTool, travelRemindersTool, emergencyContactsTool, dailyItineraryTool } from '../../ai/itinerary-tools';
import { Place } from '../../managers/types';

export const config = {
    runtime: 'edge'
};

interface ItineraryRequestBody {
    destination: string;
    startDate: string;
    endDate: string;
    preferences: string[];
    savedPlaces: Place[];
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
        const { destination, startDate, endDate, preferences, savedPlaces } = body;

        if (!destination || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // Define a helper function to generate a section
        const generateSection = async (prompt: string, schema: z.ZodType<any>) => {
            const { toolCalls } = await generateText({
                model: openai('gpt-4o'),
                prompt,
                tools: {
                    section: tool({
                        description: "The structured information for the requested section.",
                        parameters: schema,
                    }),
                },
                toolChoice: 'required',
            });
            return toolCalls[0].args;
        };

        const itineraryTools = {
            cityInfo: { schema: cityInfoTool.parameters, prompt: `Generate city information and a 5-day weather forecast for ${destination}.` },
            travelDetails: { schema: travelDetailsTool.parameters, prompt: `Provide essential travel details (currency, safety, navigation, local tips) for ${destination}.` },
            travelReminders: { schema: travelRemindersTool.parameters, prompt: `List important travel reminders (documents, tax, etiquette, health) for a trip to ${destination}.` },
            emergencyContacts: { schema: emergencyContactsTool.parameters, prompt: `Find emergency contacts, including hospitals and the local embassy, for ${destination}.` },
            dailyItinerary: { schema: dailyItineraryTool.parameters, prompt: `Create a detailed daily itinerary for a trip to ${destination} from ${startDate} to ${endDate}, considering these preferences: ${preferences.join(', ')}. The user has saved the following places, which should be included in the itinerary, respecting the dayIndex and orderIndex: ${JSON.stringify(savedPlaces)}` }
        };

        const promises = Object.values(itineraryTools).map(({ prompt, schema }) => 
            generateSection(prompt, schema)
        );

        const results = await Promise.allSettled(promises);

        const data = results.reduce((acc, result, index) => {
            const sectionKey = Object.keys(itineraryTools)[index];
            if (result.status === 'fulfilled') {
                acc[sectionKey] = result.value;
            } else {
                console.error(`Error generating section "${sectionKey}":`, result.reason);
                acc[sectionKey] = null; // Assign null on failure
            }
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error processing itinerary request:', error);
        return NextResponse.json({
            error: 'Failed to process itinerary request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}