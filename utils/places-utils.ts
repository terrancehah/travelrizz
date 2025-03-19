import { Place, PriceLevel } from '../managers/types';
import { savedPlacesManager } from '../managers/saved-places-manager';
import { TravelPreference, TravelSession } from '../managers/types';
import { getStoredSession, SESSION_CONFIG } from '../managers/session-manager';
import { safeStorageOp, storage } from '../utils/storage-utils';
import Router from 'next/router';

interface GooglePlaceResponse {
    id: string;
    displayName: {
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
        periods: Array<{
            open: { day: number; hour: number; minute: number };
            close?: { day: number; hour: number; minute: number };
        }>;
        weekdayDescriptions: string[];
        openNow: boolean;
        nextOpenTime?: { date: string } | null;
        nextCloseTime?: { date: string } | null;
    };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: PriceLevel;
}

interface ParallelSearchParams {
    latitude: number;
    longitude: number;
    includedTypes: string[];
    maxResults?: number;
    fromPreferences?: boolean;
    fromPlaceTypes?: boolean;
    languageCode: string;
}

export const preferenceToPlaceTypes: Record<TravelPreference, string[]> = {
    [TravelPreference.Culture]: [
        'museum', 'cultural_center', 'cultural_landmark', 'historical_landmark', 
        'monument', 'art_gallery', 'historical_place'
    ],
    [TravelPreference.Nature]: [
        'national_park', 'state_park', 'botanical_garden', 'wildlife_park', 
        'garden', 'hiking_area', 'wildlife_refuge'
    ],
    [TravelPreference.Food]: [
        'restaurant', 'fine_dining_restaurant', 'cafe', 'food_court', 
        'bakery', 'dessert_shop', 'bar_and_grill'
    ],
    [TravelPreference.Leisure]: [
        'wellness_center', 'shopping_mall', 'beach', 'garden', 'plaza', 'yoga_studio'
    ],
    [TravelPreference.Adventure]: [
        'adventure_sports_center', 'amusement_park', 'hiking_area', 'sports_complex', 
        'water_park', 'off_roading_area', 'sports_activity_location'
    ],
    [TravelPreference.Arts]: [
        'art_gallery', 'art_studio', 'performing_arts_theater', 'auditorium', 
        'concert_hall', 'museum', 'opera_house'
    ]
};

export function getPlaceTypesFromPreferences(preferences: TravelPreference[]): string[] {
    try {
        const usedTypes = new Set<string>();
        const resultTypes: string[] = [];
        preferences.forEach(pref => {
            const availableTypes = preferenceToPlaceTypes[pref]?.filter(type => !usedTypes.has(type)) || [];
            if (availableTypes.length > 0) {
                const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                resultTypes.push(selectedType);
                usedTypes.add(selectedType);
            }
        });
        return resultTypes;
    } catch (error) {
        console.error('Error getting place types from preferences:', error);
        return [];
    }
}

export const getDisplayName = (place: Place): string => {
    if (typeof place.displayName === 'string') return place.displayName;
    return place.displayName?.text || '';
};

export function filterUniquePlaces(places: Place[]): Place[] {
    if (!places || !Array.isArray(places)) return [];
    const savedPlaces = savedPlacesManager.getPlaces();
    const savedPlaceIds = new Set(savedPlaces.map((place: Place) => place.id));
    const savedPlaceNames = new Set(savedPlaces.map((place: Place) => 
        typeof place.displayName === 'string' ? place.displayName.toLowerCase() : place.displayName.text.toLowerCase()
    ));
    const seenIds = new Set<string>();
    return places.filter(place => {
        if (!place.id) return false;
        if (savedPlaceIds.has(place.id) || seenIds.has(place.id)) return false;
        const placeName = typeof place.displayName === 'string' ? place.displayName.toLowerCase() : place.displayName.text.toLowerCase();
        if (savedPlaceNames.has(placeName)) return false;
        seenIds.add(place.id);
        return true;
    });
}

interface MapOperationDetail {
    type: 'add-place' | 'remove-place' | 'places-changed';
    place?: Place;
    placeId?: string;
    places?: Place[];
    count?: number;
}

const dispatchMapOperation = (detail: MapOperationDetail) => {
    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', { detail }));
};

declare global {
    interface Window {
        savedPlacesManager?: import('../managers/saved-places-manager').SavedPlacesManager;
        savedPlaces: Place[];
    }
}

export interface SearchConfig {
    endpoint: 'text' | 'nearby';
    query?: string;
    includedTypes?: string[];
    location: { latitude: number; longitude: number };
    maxResults?: number;
    radius?: number;
    languageCode?: string;
    locationRestriction?: { circle: { center: { latitude: number; longitude: number }; radius: number } };
    locationBias?: { circle: { center: { latitude: number; longitude: number }; radius: number } };
}

async function searchPlacesBase(config: SearchConfig): Promise<Place[]> {
    try {
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        const url = `${baseUrl}/api/places/search`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            console.error('Failed to search places:', response.status, await response.text());
            return [];
        }

        const data = await response.json();
        const rawPlaces = data.places || [];
        return rawPlaces
            .map((place: GooglePlaceResponse) => transformPlaceResponse(place))
            .filter((place: Place | null): place is Place => place !== null);
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
}

export async function searchPlaceByText(
    searchText: string,
    location: { latitude: number; longitude: number },
    destination: string,
    languageCode?: string
): Promise<Place | null> {
    console.log('[searchPlaceByText] Starting search with:', { searchText, location, destination, languageCode });
    try {
        const places = await searchPlacesBase({
            endpoint: 'text',
            query: searchText,
            location,
            radius: 15000.0,
            maxResults: 10,
            languageCode: languageCode || Router.locale || 'en'
        });
        if (places.length === 0) return null;

        const place = places[0];
        const isAlreadySaved = savedPlacesManager.hasPlace(place.id);
        if (!isAlreadySaved) {
            console.log('[searchPlaceByText] Adding new place:', { id: place.id, name: getDisplayName(place) });
            savedPlacesManager.addPlace(place);
            const metrics: TravelSession = metricsManager.get();
            metrics.savedPlacesCount = savedPlacesManager.places.size;
            metricsManager.update(metrics);
            dispatchMapOperation({ type: 'add-place', place });
        }
        console.log('[searchPlaceByText] Found place:', { id: place.id, name: getDisplayName(place), isAlreadySaved });
        return place;
    } catch (error) {
        console.error('[searchPlaceByText] Error searching for place:', error);
        return null;
    }
}

export const searchMultiplePlacesByText = async (
    searchText: string,
    location: { latitude: number; longitude: number },
    maxResults: number = 10,
    languageCode: string
): Promise<Place[]> => {
    try {
        return await searchPlacesBase({
            endpoint: 'text',
            query: searchText,
            location,
            radius: 15000.0,
            maxResults,
            languageCode
        });
    } catch (error) {
        console.error('Error searching for places:', error);
        return [];
    }
};

export async function parallelSearchByPreferences({
    latitude,
    longitude,
    includedTypes,
    maxResults = 10,
    fromPreferences = false,
    fromPlaceTypes = false,
    languageCode
}: ParallelSearchParams): Promise<Place[]> {
    try {
        console.log('Executing parallel search with params:', {
            latitude, longitude, includedTypes, maxResults, fromPreferences, fromPlaceTypes, languageCode
        });
        const resultsPerType = Math.ceil(maxResults / includedTypes.length);
        const searchPromises = includedTypes.map(type =>
            searchPlacesBase({
                endpoint: 'nearby',
                location: { latitude, longitude },
                includedTypes: [type],
                maxResults: resultsPerType,
                radius: 15000,
                languageCode
            })
        );
        const results = await Promise.all(searchPromises);
        const places = results.flat().filter(place => place !== null);
        const uniquePlaces = filterUniquePlaces(places);
        const finalPlaces = uniquePlaces.slice(0, maxResults);
        console.log('[parallelSearchByPreferences] Found unique places:', finalPlaces.length);
        return finalPlaces;
    } catch (error) {
        console.error('[parallelSearchByPreferences] Error:', error);
        return [];
    }
}

function initializeMetrics(): TravelSession {
    if (typeof window === 'undefined') {
        return {
            sessionId: '', startTime: Date.now(), lastActive: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, destination: '', startDate: '', endDate: '',
            preferences: [], budget: '', language: '', transport: [], savedPlaces: [],
            currentStage: 1, totalPrompts: 0, stagePrompts: { 1: 0, 2: 0, 3: 0 },
            savedPlacesCount: 0, isPaid: false, paymentReference: ''
        };
    }
    const session = getStoredSession() || initializeMetrics();
    session.savedPlacesCount = savedPlacesManager.places.size;
    return session;
}

function updateMetrics(session: TravelSession) {
    if (typeof window === 'undefined') return;
    try {
        const storedSession = getStoredSession();
        if (!storedSession) return;
        storedSession.totalPrompts = session.totalPrompts;
        storedSession.stagePrompts = session.stagePrompts;
        storedSession.savedPlacesCount = session.savedPlacesCount;
        sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(storedSession));
    } catch (error) {
        console.error('[Places] Error updating metrics:', error);
    }
}

export const metricsManager = { get: initializeMetrics, update: updateMetrics };

export const transformPlaceResponse = (place: GooglePlaceResponse): Place | null => {
    if (!place || !place.id) return null;
    const transformed: Place = {
        id: place.id,
        displayName: place.displayName,
        formattedAddress: place.formattedAddress,
        location: place.location,
        primaryType: place.primaryType,
        primaryTypeDisplayName: place.primaryTypeDisplayName,
        dayIndex: (place as any).dayIndex,
        orderIndex: (place as any).orderIndex,
        photos: place.photos?.slice(0, 5).map(photo => ({
            name: photo.name,
            widthPx: photo.widthPx,
            heightPx: photo.heightPx
        })) || [],
        regularOpeningHours: place.regularOpeningHours && place.regularOpeningHours.periods ? {
            periods: place.regularOpeningHours.periods.map(period => ({
                open: { day: period.open.day, hour: period.open.hour, minute: period.open.minute },
                close: period.close ? { day: period.close.day, hour: period.close.hour, minute: period.close.minute } : undefined
            })),
            weekdayDescriptions: place.regularOpeningHours.weekdayDescriptions,
            openNow: place.regularOpeningHours.openNow,
            nextOpenTime: place.regularOpeningHours.nextOpenTime,
            nextCloseTime: place.regularOpeningHours.nextCloseTime
        } : undefined,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        priceLevel: place.priceLevel
    };
    return transformed;
};