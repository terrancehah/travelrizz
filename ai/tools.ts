import { z } from 'zod';
import { tool as createTool, ToolExecutionOptions } from 'ai';
import { 
    TravelPreference,
    BudgetLevel,
    SupportedLanguage,
    ComponentType,
    TravelDetails
} from '@/managers/types';
import { 
    searchPlaceByText,
    searchMultiplePlacesByText,
    parallelSearchByPreferences,
    getPlaceTypesFromPreferences
} from '@/utils/places-utils';
import { savedPlacesManager } from '@/managers/saved-places-manager';
import { getStoredSession, SESSION_CONFIG } from '@/managers/session-manager';
import { Place } from '@/managers/types';
import { validateStageProgression } from '@/managers/stage-manager';
import { safeStorageOp, storage } from '@/utils/storage-utils';
import { fetchExchangeRates, getCurrencyFromCountry } from '@/utils/currency-utils';
import { fetchWeatherForecast, isWithinForecastRange, formatDate } from '@/utils/forecast-utils';
import { formatDateRange, fetchHistoricalWeatherData, processHistoricalData, getPreviousYearDates } from '@/utils/historical-utils';
import { optimizeItinerary } from '@/utils/route-optimizer';

// Standardized Tool Response interfaces
export interface ToolResponse<T = Record<string, unknown>> {
    type: string;
    status: 'success' | 'error' | 'empty';
    props: T;
    error?: string;
}

export interface BaseToolProps {
    error?: string;
    loading?: boolean;
}

// Context holder for request-specific data
let requestContext: { savedPlaces: Place[] } | null = null;

// Functions to manage the context
export function setRequestContext(context: { savedPlaces: Place[] }) {
    requestContext = context;
}

export function getRequestContext() {
    return requestContext;
}

// Tool for Budget Selection
export const budgetSelectorTool = createTool({
    description: 'Display budget level options for the trip. Call this tool when the user wants to set their budget level.',
    parameters: z.object({
        currentBudget: z.enum(['Budget', 'Moderate', 'Luxury', 'Ultra Luxury'] as const).optional()
    }),
    execute: async function ({ currentBudget }) {
        return {
            type: 'budgetSelector',
            props: {
                currentBudget: currentBudget as BudgetLevel
            }
        };
    }
});

// Tool for Travel Preferences
export const preferenceSelectorTool = createTool({
    description: 'Display options for selecting travel preferences and interests. Call this tool when the user wants to set their travel preferences.',
    parameters: z.object({
        currentPreferences: z.array(z.nativeEnum(TravelPreference)).optional()
    }),
    execute: async function ({ currentPreferences }) {
        return {
            type: 'preferenceSelector',
            props: {
                currentPreferences: currentPreferences as TravelPreference[]
            }
        };
    }
});

// Tool for Date Selection
export const datePickerTool = createTool({
    description: 'Display a date picker for selecting travel dates. Call this tool when the user wants to set their travel dates.',
    parameters: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
    }),
    execute: async function ({ startDate, endDate }) {
        return {
            type: 'datePicker',
            props: {
                startDate,
                endDate
            }
        };
    }
});

// Tool for Language Selection
export const languageSelectorTool = createTool({
    description: 'Display language selection options.',
    parameters: z.object({
        currentLanguage: z.string().optional()
    }),
    execute: async function ({ currentLanguage }) {
        return {
            type: 'languageSelector',
            props: {
                currentLanguage: currentLanguage as SupportedLanguage
            }
        };
    }
});

// Tool for Transport Selection
export const transportSelectorTool = createTool({
    description: 'Display transport method selection options. Use this when discussing transportation options for the trip, such as flights, trains, or car rentals.',
    parameters: z.object({
        selectedMethod: z.string().optional()
    }),
    execute: async function ({ selectedMethod }) {
        return {
            type: 'transportSelector',
            props: { selectedMethod }
        };
    }
});

// Tool for Place Display
export const placeCardTool = createTool({
    description: 'Display information about one specific place. Use this whenever the user explicitly asks for ONE place, whether by name or type (e.g., \"show me one theatre\", \"show me one restaurant\", \"show me The Little Mermaid statue\").',
    parameters: z.object({
        searchText: z.string().describe('The name or description of the place to search for'),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        }),
        destination: z.string().describe('Name of the destination city'),
        languageCode: z.string().default('en')
    }),
    execute: async function ({ searchText, location, destination, languageCode }) {
        try {
            const place = await searchPlaceByText(searchText, location, destination, languageCode);
            
            if (!place) {
                console.error('No place found for search text:', searchText);
                return {
                    type: 'placeCard',
                    props: { place: null },
                    error: 'Could not find a unique place. Try searching for something else.'
                };
            }
            
            return {
                type: 'placeCard',
                props: { 
                    place
                }
            };
        } catch (error) {
            console.error('Error searching for place:', error);
            return {
                type: 'placeCard',
                props: { place: null }
            };
        }
    }
});

// Tool for Place Carousel
export const placeCarouselTool = createTool({
    description: 'Display multiple places in a carousel based on preferences or specific place types and automatically save them into savedPlaces.',
    parameters: z.object({
        preferences: z.array(z.nativeEnum(TravelPreference)).optional(), // Changed to array
        placeType: z.string().optional().describe('Specific place type to search for'),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        }),
        maxResults: z.number().optional().default(5),
        languageCode: z.string().default('en')  // Add language code parameter with default
    }),
    execute: async function ({ preferences, placeType, location, maxResults, languageCode }) {
        try {
            let places: Place[] = [];
            
            if (placeType) {
                // Use text search for specific place types
                places = await searchMultiplePlacesByText(
                    placeType,
                    location,
                    maxResults,
                    languageCode
                );
            } else if (preferences && preferences.length > 0) {
                // Get place types from preferences
                const placeTypes = getPlaceTypesFromPreferences(preferences);
                
                // Use parallelSearchByPreferences with the language code
                places = await parallelSearchByPreferences({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    includedTypes: placeTypes,
                    maxResults,
                    fromPreferences: true,
                    languageCode
                });
            }
            return {
                type: 'placeCarousel',
                props: { places }
            };
        } catch (error) {
            console.error('Error in placeCarousel tool:', error);
            return {
                type: 'placeCarousel',
                props: { places: [] }
            };
        }
    }
});


export const savedPlacesListTool = createTool({
    description: 'Display all currently saved places in a list view. When user asks to see saved places (e.g. "show me my saved places", "what places have I saved", etc), pass ALL places from the savedPlaces parameter to this tool.',
    parameters: z.object({
        savedPlaces: z.array(z.object({
            id: z.string(),
            displayName: z.union([
                z.object({
                    text: z.string(),
                    languageCode: z.string()
                }),
                z.string()
            ]).optional(),
            primaryType: z.string().optional(),
            location: z.object({
                latitude: z.number(),
                longitude: z.number()
            }).optional(), 
            formattedAddress: z.string().optional(),
            photos: z.array(z.object({
                name: z.string(),
                widthPx: z.number().optional(),
                heightPx: z.number().optional(),
                authorAttributions: z.array(z.object({
                    displayName: z.string().optional(),
                    uri: z.string().optional(),
                    photoUri: z.string().optional()
                })).optional()
            })).optional().default([]), 
            primaryTypeDisplayName: z.object({
                text: z.string(),
                languageCode: z.string()
            }).optional(),
            regularOpeningHours: z.object({
                periods: z.array(z.object({
                    open: z.object({
                        day: z.number(),
                        hour: z.number(),
                        minute: z.number()
                    }),
                    close: z.object({
                        day: z.number(),
                        hour: z.number(),
                        minute: z.number()
                    }).optional()
                })),
                weekdayDescriptions: z.array(z.string()),
                openNow: z.boolean(),
                nextOpenTime: z.object({ date: z.string() }).nullable().optional(),
                nextCloseTime: z.object({ date: z.string() }).nullable().optional()
            }).optional(),
            dayIndex: z.number().optional(),
            orderIndex: z.number().optional()
        }))
    }),
    execute: async function ({ savedPlaces }) {
        console.log('[savedPlacesListTool] Executing with places:', savedPlaces?.map(p => ({
            id: p.id,
            hasPhotos: Boolean(p.photos?.length),
            photoCount: p.photos?.length,
            firstPhoto: p.photos?.[0],
            primaryTypeDisplayName: p.primaryTypeDisplayName
        })));
        
        // Ensure we're passing the full array of places
        if (!Array.isArray(savedPlaces)) {
            console.error('[savedPlacesListTool] savedPlaces is not an array:', savedPlaces);
            return {
                type: 'savedPlacesList',
                props: { places: [] }
            };
        }
        
        // Make sure we pass the complete place objects
        return {
            type: 'savedPlacesList',
            props: { 
                places: savedPlaces.map(place => ({
                    ...place,
                    photos: place.photos || [],
                    primaryTypeDisplayName: place.primaryTypeDisplayName || { text: '', languageCode: 'en' }
                })),
                onRemove: undefined // Make it explicit that we're not handling removal here
            }
        };
    }
});

// Simplify the stage progress tool to only include nextStage
export const stageProgressTool = createTool({
    description: `Update the current planning stage only when certain criteria are met. 
    Only trigger this tool if user want to proceed to the next stage and gives their explicit confirmation.`,
    parameters: z.object({
        currentStage: z.number().min(1).max(5),
        nextStage: z.number().min(1).max(5),
        travelDetails: z.object({
            destination: z.string(),
            location: z.object({
                latitude: z.number(),
                longitude: z.number()
            }),
            startDate: z.string(),
            endDate: z.string(),
            preferences: z.array(z.string()),
            budget: z.string(),
            language: z.string(),
            transport: z.array(z.string()).optional(),
        }),
        metrics: z.object({
            totalPrompts: z.number(),
            savedPlacesCount: z.number(),
            isPaid: z.boolean(),
            paymentReference: z.string()
        })
    }),
    execute: async function({ currentStage, nextStage, travelDetails, metrics }) {
        // Validate stages using validateStageProgression, assuming it's client-side
        const validationResult = validateStageProgression(
            currentStage,
            nextStage,
            travelDetails as TravelDetails,
            metrics.isPaid
        );
        
        if (!validationResult.canProgress) {
            console.log('[StageProgressTool] Validation failed:', validationResult.missingRequirements);
            return {
                type: 'stageProgress',
                status: 'error',
                props: { 
                    nextStage: currentStage,
                    error: `Cannot progress to stage ${nextStage}. Missing: ${validationResult.missingRequirements.join(', ')}`,
                    upgradeRequired: validationResult.upgradeRequired
                }
            };
        }

        // Return success, client will handle session update
        return {
            type: 'stageProgress',
            status: 'success',
            props: { nextStage }
        };
    }
});

// Tool for Quick Response
export const quickResponseTool = createTool({
    description: `Present users with exactly 3 contextually relevant quick response options.
    
    CRITICAL RULES:
    1. YOU MUST ALWAYS RETURN EXACTLY 3 OPTIONS - NO EXCEPTIONS
    2. Keep options concise and action-oriented
    3. Options must make sense as natural chat responses
    4. Each option should be 2-6 words
    
    Stage-specific guidelines:
    Stage 1: Focus on parameter updates (e.g., \"Update my travel dates\", \"Change my budget\")
    Stage 2: Focus on city info (e.g., \"Check the weather\", \"See currency rates\")
    Stage 3: Focus on places (e.g., \"Show me museums\", \"Find restaurants\")`,
    parameters: z.object({
        responses: z.array(z.string()).length(3).describe('Exactly 3 quick response options')
    }),
    execute: async function ({ responses }) {
        // console.log('[QuickResponse Tool] Executing with responses:', responses);
        
        if (!Array.isArray(responses) || responses.length !== 3) {
            console.error('[QuickResponse Tool] Invalid responses:', responses);
            throw new Error('Must provide exactly 3 responses');
        }
        
        // Validate each response
        responses.forEach((response, index) => {
            if (!response || typeof response !== 'string' || response.trim().length === 0) {
                throw new Error(`Invalid response at index ${index}`);
            }
        });
        
        console.log('[QuickResponse Tool] Returning valid responses');
        
        return {
            type: 'quickResponse',
            props: { responses }
        };
    }
});

// Tool for Currency Conversion
export const currencyConverterTool = createTool({
    description: 'Display currency conversion rates for the destination country. Use this when discussing costs, budgets, or when the user wants to understand currency exchange rates.',
    parameters: z.object({
        amount: z.number().optional().default(100).describe('Amount to convert in the destination currency'),
        destination: z.string().describe('Destination country or city')
    }),
    execute: async function ({ amount = 100, destination }) {
        if (!destination) {
            throw new Error('Destination is required for currency conversion');
        }
        
        const baseCurrency = getCurrencyFromCountry(destination);
        
        try {
            // Use the modified fetchExchangeRates function
            const rates = await fetchExchangeRates(baseCurrency);
            
            return {
                type: 'currencyConverter',
                props: {
                    baseCurrency,
                    baseAmount: amount,
                    defaultCurrencies: ['USD', 'EUR', 'GBP', 'CNY', 'JPY'],
                    // Include rates for AI to reference in its response
                    rates
                }
            };
        } catch (error) {
            console.error('Error in currencyConverterTool:', error);
            throw error;
        }
    }
});

// Tool for Weather Forecast
export const weatherForecastTool = createTool({
    description: 'Display weather forecast for a location. Triggered when travel dates are within the next 7 days.',
    parameters: z.object({
        lat: z.number().min(-90).max(90).describe('Latitude of the location'),
        lon: z.number().min(-180).max(180).describe('Longitude of the location'),
        city: z.string().describe('City name for display'),
        units: z.enum(['us', 'uk', 'metric'] as const).optional().default('metric')
    }),
    execute: async function ({ lat, lon, city, units = 'metric' }) {
        try {
            const forecastData = await fetchWeatherForecast(
                lat, 
                lon, 
                units
            );
            
            return {
                type: 'weatherForecast',
                props: {
                    lat,
                    lon,
                    city,
                    units,
                    // Include the actual weather forecast data for the AI to reference
                    forecastData: forecastData.data,
                    summary: forecastData.summary
                }
            };
        } catch (error) {
            console.error('Error in weatherForecastTool:', error);
            throw error;
        }
    }
});

export const weatherHistoricalTool = createTool({
    description: 'Display historical weather data for a location one year ago. Triggered when travel dates are beyond the forecastable range of the next 7 days.',
    parameters: z.object({
        lat: z.number().min(-90).max(90).describe('Latitude of the location'),
        lon: z.number().min(-180).max(180).describe('Longitude of the location'),
        city: z.string().describe('City name for display'),
        startDate: z.string().describe('Trip start date in DD/MM/YYYY format'),
        endDate: z.string().describe('Trip end date in DD/MM/YYYY format'),
        units: z.enum(['us', 'uk', 'metric'] as const).optional().default('metric'),
    }),
    execute: async function ({ lat, lon, city, startDate, endDate, units = 'metric' }) {
        try {
            const historicalDates = getPreviousYearDates(startDate, endDate);
            const rawData = await fetchHistoricalWeatherData(lat, lon, historicalDates.startDate, historicalDates.endDate, units);
            const processedData = processHistoricalData(rawData);
            const { startDate: isoStart, endDate: isoEnd } = formatDateRange(startDate, endDate);
            
            return {
                type: 'weatherHistorical',
                props: {
                    lat,
                    lon,
                    city,
                    startDate: isoStart, // Original dates for display
                    endDate: isoEnd,
                    units,
                    weatherData: processedData.data,
                    historicalYear: historicalDates.year, // Use adjusted year
                    averages: processedData.averages,
                },
            };
        } catch (error) {
            console.error('Error in weatherHistoricalTool:', error);
            throw error;
        }
    },
});

// Tool for Local Tips
export const localTipsTool = createTool({
    description: 'Display about 5 destination-specific local tips and cultural etiquettes. Use this when users ask about local customs, cultural norms, or travel etiquette for their destination.',
    parameters: z.object({
        destination: z.string().describe('Name of the destination city/country'),
        tips: z.array(z.object({
            summary: z.string().describe('Brief overview of the tip (1-2 sentences)'),
            description: z.string().describe('Detailed explanation of the tip')
        }))
    }),
    execute: async function ({ destination, tips }) {
        return {
            type: 'localTips',
            props: {
                destination,
                tips
            }
        };
    }
});

// Tool for Place Optimization
export const placeOptimizerTool = createTool({
    description: 'Optimize the arrangement of saved places based on travel time and opening hours. Use this when the user wants to optimize the itinerary or routes.',
    parameters: z.object({
        startDate: z.string().describe('Trip start date in ISO format'),
        endDate: z.string().describe('Trip end date in ISO format')
    }),
    execute: async function ({ startDate, endDate }) {
        try {
            // Access savedPlaces from the request context
            const context = getRequestContext();
            if (!context?.savedPlaces || context.savedPlaces.length === 0) {
                throw new Error('No places to optimize');
            }
            
            const result = await optimizeItinerary(context.savedPlaces, startDate, endDate);
            return {
                type: 'placeOptimizer',
                props: {
                    content: 'Successfully optimized travel itinerary',
                    optimizedPlaces: result,
                    startDate,
                    endDate,
                },
            };
        } catch (error) {
            console.error('[placeOptimizerTool] Error:', error);
            return {
                type: 'error',
                props: {
                    error: 'Optimization failed: ' + 
                    (error instanceof Error ? error.message : 'Unknown error')
                }
            };
        }
    }
});

// Export all tools with their names
export const tools = {
    budgetSelector: budgetSelectorTool,
    preferenceSelector: preferenceSelectorTool,
    datePicker: datePickerTool,
    languageSelector: languageSelectorTool,
    transportSelector: transportSelectorTool,
    placeCard: placeCardTool,
    placeCarousel: placeCarouselTool,
    weatherHistorical: weatherHistoricalTool,
    savedPlacesList: savedPlacesListTool,
    stageProgress: stageProgressTool,
    quickResponse: quickResponseTool,
    currencyConverter: currencyConverterTool,
    weatherForecast: weatherForecastTool,
    localTips: localTipsTool,
    placeOptimizer: placeOptimizerTool
};
