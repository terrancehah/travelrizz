import { Place, PriceLevel } from '../managers/types';

interface GooglePlaceResponse {
    id: string;
    name?: string;
    displayName?: {
        text: string;
        languageCode: string;
    };
    formattedAddress?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    primaryType?: string;
    primaryTypeDisplayName?: {
        text: string;
        languageCode: string;
    };
    photos?: Array<{
        name: string;
        widthPx?: number;
        heightPx?: number;
        authorAttributions?: Array<{
            displayName?: string;
            uri?: string;
            photoUri?: string;
        }>;
    }>;
    regularOpeningHours?: {
        periods?: Array<{
            open: { day: number; hour: number; minute: number };
            close: { day: number; hour: number; minute: number };
        }>;
        weekdayDescriptions: string[];
        openNow: boolean;
    };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: PriceLevel;
}

interface FetchPlacesParams {
    latitude: number;
    longitude: number;
    includedTypes: string[];
    maxResults?: number;
    fromPreferences?: boolean;
    fromPlaceTypes?: boolean;
    languageCode: string;
}

import { TravelPreference, TravelSession } from '../managers/types';
import { getStoredSession, getStoredMetrics, SESSION_CONFIG, safeStorageOp, storage } from '../managers/session-manager';
import Router from 'next/router';

// Updated preference to place types mapping based on travel-rizz.html
export const preferenceToPlaceTypes: Record<TravelPreference, string[]> = {
    [TravelPreference.Culture]: [
        'museum',
        'cultural_center',
        'cultural_landmark',
        'historical_landmark',
        'monument',
        'art_gallery',
        'historical_place'
    ],
    [TravelPreference.Nature]: [
        'national_park',
        'state_park',
        'botanical_garden',
        'wildlife_park',
        'garden',
        'hiking_area',
        'wildlife_refuge'
    ],
    [TravelPreference.Food]: [
        'restaurant',
        'fine_dining_restaurant',
        'cafe',
        'food_court',
        'bakery',
        'dessert_shop',
        'bar_and_grill'
    ],
    [TravelPreference.Leisure]: [
        'spa',
        'wellness_center',
        'shopping_mall',
        'beach',
        'garden',
        'plaza',
        'yoga_studio'
    ],
    [TravelPreference.Adventure]: [
        'adventure_sports_center',
        'amusement_park',
        'hiking_area',
        'sports_complex',
        'water_park',
        'off_roading_area',
        'sports_activity_location'
    ],
    [TravelPreference.Arts]: [ // Arts and Museum
        'art_gallery',
        'art_studio',
        'performing_arts_theater',
        'auditorium',
        'concert_hall',
        'museum',
        'opera_house'
    ]
};

// Helper function to get place types based on preferences
export function getPlaceTypesFromPreferences(preferences: TravelPreference[]): string[] {
    try {
        // Track used types to avoid repeats
        const usedTypes = new Set<string>();
        const resultTypes: string[] = [];
        
        // Process each preference
        preferences.forEach(pref => {
            const availableTypes = preferenceToPlaceTypes[pref]?.filter(
                type => !usedTypes.has(type)
            ) || [];
            
            // Take up to 3 types from each preference
            const numTypes = Math.min(3, availableTypes.length);
            const selectedTypes = availableTypes
                .sort(() => Math.random() - 0.5)
                .slice(0, numTypes);
                
            // Add to results and mark as used
            selectedTypes.forEach(type => {
                resultTypes.push(type);
                usedTypes.add(type);
            });
        });

        // If we don't have enough types, add more from the available types
        if (resultTypes.length < 5) {
            const allTypes = preferences.flatMap(pref => preferenceToPlaceTypes[pref] || []);
            const remainingTypes = allTypes.filter(type => !usedTypes.has(type));
            const additionalTypes = remainingTypes
                .sort(() => Math.random() - 0.5)
                .slice(0, 5 - resultTypes.length);
            additionalTypes.forEach(type => {
                resultTypes.push(type);
                usedTypes.add(type);
            });
        }

        // Ensure we only return 5 types maximum
        return resultTypes.slice(0, 5);
    } catch (error) {
        console.error('Error getting place types from preferences:', error);
        return ['tourist_attraction']; // Default fallback
    }
}

// Helper function to get display name for place type
export const getDisplayName = (place: Place): string => {
    if (typeof place.displayName === 'string') {
        return place.displayName;
    }
    return place.displayName?.text || place.name || '';
};

// Function to filter out duplicate places
export function filterUniquePlaces(places: Place[]): Place[] {
    if (!places || !Array.isArray(places)) return [];

    // Get saved places from global state if available
    const savedPlaces = savedPlacesManager.getPlaces();

    const savedPlaceIds = new Set(savedPlaces.map((place: Place) => place.id));
    const savedPlaceNames = new Set(savedPlaces.map((place: Place) => 
        typeof place.displayName === 'string' 
            ? place.displayName.toLowerCase() 
            : place.displayName.text.toLowerCase()
    ));

    // Track seen IDs in current result set
    const seenIds = new Set<string>();

    // Filter out places that:
    // 1. Have same ID as saved place
    // 2. Have same name as saved place
    // 3. Have duplicate IDs in current result set
    return places.filter(place => {
        if (!place.id) return false;
        if (savedPlaceIds.has(place.id)) return false;
        if (seenIds.has(place.id)) return false;
        
        const placeName = typeof place.displayName === 'string' 
            ? place.displayName.toLowerCase()
            : place.displayName.text.toLowerCase();
            
        if (savedPlaceNames.has(placeName)) return false;
        
        seenIds.add(place.id);
        return true;
    });
}

import { savedPlacesManager } from '../managers/saved-places-manager';
export { savedPlacesManager };

// Declare window interface for saved places
declare global {
    interface Window {
        savedPlaces: Place[];
        addPlaceToMap?: (place: {
            latitude: number;
            longitude: number;
            title?: string;
            place?: Place;
        }) => void;
        getSavedPlaces?: () => Place[];
    }
}

// New detection function
export const messageContainsPlaceType = (message: string): boolean => {
    const placeTypeKeywords = [
        'museum', 'gallery', 'restaurant', 'cafe', 
        'park', 'landmark', 'hotel', 'hostel'
    ];
    return new RegExp(`\\b(${placeTypeKeywords.join('|')})\\b`, 'i').test(message);
}

// Base configuration type for search operations
interface PlacesSearchConfig {
    location: { latitude: number; longitude: number };
    maxResults?: number;
    radius?: number;
    fieldMask?: string;
    languageCode?: string;  // Add language code parameter
}

// Base search function that handles all search operations
async function searchPlacesBase(
    config: PlacesSearchConfig & {
        endpoint: 'text' | 'nearby';
        query: string | string[];
    }
): Promise<Place[]> {
    try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            console.error('Google Maps API key is missing');
            return [];
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName.text,places.displayName.languageCode,places.formattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName.text,places.primaryTypeDisplayName.languageCode,places.photos.name,places.photos.widthPx,places.photos.heightPx,places.regularOpeningHours,places.rating,places.userRatingCount,places.priceLevel'
        };

        const endpoint = config.endpoint === 'text' 
            ? 'https://places.googleapis.com/v1/places:searchText'
            : 'https://places.googleapis.com/v1/places:searchNearby';

        const requestBody = config.endpoint === 'text' 
            ? {
                textQuery: config.query as string,
                locationBias: {
                    circle: {
                        center: config.location,
                        radius: config.radius || 20000.0
                    }
                },
                maxResultCount: config.maxResults || 5,
                languageCode: config.languageCode || 'en'  // Add language code
            }
            : {
                locationRestriction: {
                    circle: {
                        center: config.location,
                        radius: config.radius || 5000.0
                    }
                },
                includedTypes: Array.isArray(config.query) ? config.query : [config.query],
                maxResultCount: config.maxResults || 5,
                languageCode: config.languageCode || 'en'  // Modify to use config language code
            };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Failed to search places:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            return [];
        }

        const data = await response.json();
        
        if (!data.places || !Array.isArray(data.places) || data.places.length === 0) {
            return [];
        }

        return data.places
            .map((place: GooglePlaceResponse) => transformPlaceResponse(place))
            .filter((place: Place | null): place is Place => place !== null);
    } catch (error) {
        console.error('Error in searchPlacesBase:', error);
        return [];
    }
}

export async function searchPlaceByText(
    searchText: string,
    location: { latitude: number; longitude: number },
    destination: string,
    languageCode?: string  // Make languageCode optional
): Promise<Place | null> {
    console.log('[searchPlaceByText] Starting search with:', {
        searchText,
        location,
        destination,
        languageCode
    });

    try {
        const places = await searchPlacesBase({
            endpoint: 'text',
            query: searchText,
            location,
            maxResults: 1,
            languageCode: languageCode || Router.locale || 'en'  // Use Router.locale as fallback
        });
        
        if (places.length === 0) {
            return null;
        }

        const place = places[0];
        
        // Check if place is already saved using savedPlacesManager
        const isAlreadySaved = savedPlacesManager.hasPlace(place.id);
        
        if (!isAlreadySaved) {
            console.log('[searchPlaceByText] Adding new place:', {
                id: place.id,
                name: getDisplayName(place)
            });
            savedPlacesManager.addPlace(place);
            
            // Update metrics
            const metrics: TravelSession = metricsManager.get();
            metrics.savedPlacesCount = savedPlacesManager.places.size;
            metricsManager.update(metrics);
        }

        console.log('[searchPlaceByText] Found place:', {
            id: place.id,
            name: getDisplayName(place),
            isAlreadySaved
        });

        return place;
    } catch (error) {
        console.error('[searchPlaceByText] Error searching for place:', error);
        return null;
    }
}

export const searchMultiplePlacesByText = async (
    searchText: string,
    location: { latitude: number; longitude: number },
    maxResults: number = 5,
    languageCode: string = 'en'  // Add language code parameter with default
): Promise<Place[]> => {
    try {
        return await searchPlacesBase({
            endpoint: 'text',
            query: searchText,
            location,
            maxResults,
            languageCode  // Pass the language code
        });
    } catch (error) {
        console.error('Error searching for places:', error);
        return [];
    }
};

export async function fetchPlaces({
    latitude,
    longitude,
    includedTypes,
    maxResults = 5,
    fromPreferences = false,
    fromPlaceTypes = false,
    languageCode
}: FetchPlacesParams): Promise<Place[]> {
    try {
        console.log('Executing fetchplaces with params:', {
            latitude,
            longitude,
            includedTypes,
            maxResults,
            fromPreferences,
            fromPlaceTypes,
            languageCode
        });

        const location = { latitude, longitude };

        // Search for each type in parallel
        const searchPromises = includedTypes.map(type => 
            searchPlacesBase({
                endpoint: 'nearby',
                query: type,
                location,
                maxResults: 1,
                languageCode
            })
        );

        const results = await Promise.all(searchPromises);
        const places = results.flat().filter(place => place !== null);

        console.log('[fetchPlaces] Found places:', places.length);
        return places;
    } catch (error) {
        console.error('[fetchPlaces] Error:', error);
        return [];
    }
}

// Helper function to handle different search strategies
async function trySearch(
    query: string,
    headers: any,
    location: { latitude: number; longitude: number },
    maxResults: number = 5,
    languageCode: string = 'en'  // Add language code parameter
): Promise<any> {
    try {
        // First try searching by type
        const searchByTypeResponse = await fetch(
            'https://places.googleapis.com/v1/places:searchNearby',
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    locationRestriction: {
                        circle: {
                            center: location,
                            radius: 5000.0
                        }
                    },
                    includedTypes: [query],
                    maxResultCount: maxResults,
                    languageCode: languageCode  // Use the passed language code
                })
            }
        );

        if (!searchByTypeResponse.ok) {
            // If type search fails, fallback to text search
            console.log(`[trySearch] Type search failed for ${query}, falling back to text search`);
            const places = await searchMultiplePlacesByText(query, location, maxResults, languageCode);  // Pass language code
            return { places }; // Wrap in same format as type search response
        }

        const searchByTypeData = await searchByTypeResponse.json();
        if (!searchByTypeData.places || searchByTypeData.places.length === 0) {
            // If no results from type search, fallback to text search
            console.log(`[trySearch] No results from type search for ${query}, falling back to text search`);
            const places = await searchMultiplePlacesByText(query, location, maxResults, languageCode);  // Pass language code
            return { places }; // Wrap in same format as type search response
        }

        // We found a place by type search
        console.log('[trySearch] Found place for type:', { 
            type: query, 
            id: searchByTypeData.places[0].id, 
            name: searchByTypeData.places[0].displayName?.text || searchByTypeData.places[0].name 
        });
        return searchByTypeData;
    } catch (error) {
        console.error('[trySearch] Error searching for places:', error);
        return null;
    }
}

// Initialize metrics in storage
function initializeMetrics(): TravelSession {
    if (typeof window === 'undefined') {
        return {
            sessionId: '',
            startTime: Date.now(),
            lastActive: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            destination: '',
            startDate: '',
            endDate: '',
            preferences: [],
            budget: '',
            language: '',
            transport: [],
            savedPlaces: [],
            currentStage: 1,
            totalPrompts: 0,
            stagePrompts: { 1: 0, 2: 0, 3: 0 },
            savedPlacesCount: 0,
            isPaid: false,
            paymentReference: ''
        };
    }

    const session = getStoredSession();
    if (!session) {
        return initializeMetrics();
    }
    // Always ensure savedPlacesCount matches actual saved places
    session.savedPlacesCount = savedPlacesManager.places.size;
    return session;
}

// Update metrics in storage
function updateMetrics(session: TravelSession) {
    if (typeof window === 'undefined') return;
    try {
        const storedSession = getStoredSession();
        if (!storedSession) return;
        
        // Update only metrics-related fields
        storedSession.totalPrompts = session.totalPrompts;
        storedSession.stagePrompts = session.stagePrompts;
        storedSession.savedPlacesCount = session.savedPlacesCount;
        
        sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(storedSession));
    } catch (error) {
        console.error('[Places] Error updating metrics:', error);
    }
}

// Export the metrics functions
export const metricsManager = {
    get: initializeMetrics,
    update: updateMetrics
};

// Helper function to transform Google Places API response to our Place type
export const transformPlaceResponse = (place: GooglePlaceResponse): Place | null => {
    if (!place || !place.id) return null;

    // Only keep essential fields we need
    const transformed: Place = {
        id: place.id,
        name: place.name,
        displayName: place.displayName || { text: place.name || '', languageCode: 'en' },
        formattedAddress: place.formattedAddress,
        location: place.location,
        primaryType: place.primaryType ,  // Provide default value to satisfy string type
        primaryTypeDisplayName: place.primaryTypeDisplayName,
        photos: place.photos ? place.photos.map(photo => ({
            name: photo.name,
            widthPx: photo.widthPx,
            heightPx: photo.heightPx
        })) : [],
        regularOpeningHours: place.regularOpeningHours,  // Use original structure
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        priceLevel: place.priceLevel
    };

    return transformed;
};