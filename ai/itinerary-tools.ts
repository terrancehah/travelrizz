import { z } from 'zod';
import { tool } from 'ai';

export const cityInfoTool = tool({
    description: 'Generate city information including introduction, weather, language, population, and weather forecast',
    parameters: z.object({
        intro: z.string().describe('Introduction to the city'),
        weather: z.string().describe('General weather description'),
        language: z.string().describe('Primary language spoken'),
        population: z.string().describe('Population information'),
        weatherForecast: z.array(z.object({
            day: z.string().describe('Day of the forecast, e.g., "Mar 27"'),
            temp: z.number().describe('Average temperature in Celsius'),
            high: z.number().describe('Highest temperature in Celsius'),
            low: z.number().describe('Lowest temperature in Celsius'),
            icon: z.string().describe('Weather icon identifier, e.g., "cloudy"')
        })).describe('Weather forecast for the travel dates')
    }),
    execute: async (args) => args
});

export const travelDetailsTool = tool({
    description: 'Generate travel details including currency, safety tips, business hours, navigation, and local tips',
    parameters: z.object({
        currency: z.string().describe('Currency information and exchange rates'),
        safety: z.string().describe('Safety tips for travelers'),
        businessHours: z.string().describe('Typical business operating hours'),
        navigation: z.string().describe('Local transportation and navigation tips'),
        localTips: z.string().describe('Additional local travel tips')
    }),
    execute: async (args) => args
});

export const travelRemindersTool = tool({
    description: 'Generate travel reminders including documents, tax refund, etiquette, and health',
    parameters: z.object({
        documents: z.string().describe('Travel document and visa requirements'),
        taxRefund: z.string().describe('Tax refund procedures for tourists'),
        etiquette: z.string().describe('Local etiquette and cultural norms'),
        health: z.string().describe('Health and vaccination recommendations')
    }),
    execute: async (args) => args
});

export const emergencyContactsTool = tool({
    description: 'Generate emergency contacts including local numbers, hospitals, and embassy info',
    parameters: z.object({
        emergency: z.string().describe('Local emergency contact numbers'),
        hospitals: z.array(z.object({
            name: z.string().describe('Hospital name'),
            address: z.string().describe('Hospital address'),
            phone: z.string().describe('Hospital contact number'),
            notes: z.string().describe('Additional notes about the hospital')
        })).describe('List of hospitals'),
        embassy: z.string().describe('Embassy contact information')
    }),
    execute: async (args) => args
});

export const dailyItineraryTool = tool({
    description: 'Generate daily itinerary for the trip including activities by time slot',
    parameters: z.object({
        schedule: z.array(z.object({
            day: z.number().describe('Day number of the trip'),
            date: z.string().describe('Date in format "YYYY-MM-DD"'),
            schedule: z.array(z.object({
                time: z.enum(['Morning', 'Afternoon', 'Evening']).describe('Time slot of the day'),
                activities: z.array(z.object({
                    name: z.string().describe('Activity name'),
                    description: z.string().describe('Description of the activity')
                })).describe('List of activities for the time slot')
            })).describe('Schedule for the day')
        })).describe('Daily schedule for the entire trip')
    }),
    execute: async (args) => args.schedule
});