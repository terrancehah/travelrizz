///Users/terrancehah/Documents/terrancehah.com/managers/types.ts

import { Message as AiMessage, JSONValue } from 'ai';
import { ReactNode } from 'react';

// Place related types
export enum PriceLevel {
    UNSPECIFIED = 'PRICE_LEVEL_UNSPECIFIED',
    FREE = 'PRICE_LEVEL_FREE',
    INEXPENSIVE = 'PRICE_LEVEL_INEXPENSIVE',
    MODERATE = 'PRICE_LEVEL_MODERATE',
    EXPENSIVE = 'PRICE_LEVEL_EXPENSIVE',
    VERY_EXPENSIVE = 'PRICE_LEVEL_VERY_EXPENSIVE'
}

export interface Place {
    id: string;
    displayName: {
        text: string;
        languageCode: string;
    } | string;
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
    photos?: { 
        name: string;
        widthPx?: number;
        heightPx?: number;
        authorAttributions?: Array<{
            displayName?: string;
            uri?: string;
            photoUri?: string;
        }>;
    }[];
    // Optional indices for itinerary planning
    dayIndex?: number;
    orderIndex?: number;
    regularOpeningHours?: {
        // periods is required when regularOpeningHours is present
        periods: Array<{
            // open is required for each period
            open: { 
                day: number; 
                hour: number; 
                minute: number 
            };
            // close is optional for 24-hour businesses
            close?: { 
                day: number; 
                hour: number; 
                minute: number 
            };
        }>;
        // weekdayDescriptions and openNow are required
        weekdayDescriptions: string[];
        openNow: boolean;
        // nextOpenTime and nextCloseTime are optional
        nextOpenTime?: { date: string } | null;
        nextCloseTime?: { date: string } | null;
    };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: PriceLevel;
}

export interface TravelDetails {
    destination: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    startDate: string;
    endDate: string;
    preferences: string[];
    budget: string;
    language: string;
    transport?: string[];
}

export enum ComponentType {
    DatePicker = 'DatePicker',
    PreferenceSelector = 'PreferenceSelector',
    BudgetSelector = 'BudgetSelector',
    LanguageSelector = 'LanguageSelector',
    PlaceCard = 'PlaceCard',
    TransportSelector = 'TransportSelector',
    PlaceCarousel = 'PlaceCarousel',
    SavedPlacesList = 'SavedPlacesList',
    QuickResponse = 'QuickResponse'
}

export enum BudgetLevel {
    Budget = 'Budget',
    Moderate = 'Moderate',
    Luxury = 'Luxury',
    UltraLuxury = 'Ultra Luxury'
}

export enum TravelPreference {
    Culture = 'culture',
    Nature = 'nature',
    Food = 'food',
    Leisure = 'leisure',
    Adventure = 'adventure',
    Arts = 'arts'
}

export enum SupportedLanguage {
    English = 'English',
    Malay = 'Malay (Bahasa Melayu)',
    Spanish = 'Espanol',
    French = 'Francais',
    German = 'Deutsch',
    Italian = 'Italiano',
    Czech = 'Czech (Cestina)',
    SimplifiedChinese = 'Simplified Chinese (简体中文)',
    TraditionalChinese = 'Traditional Chinese (繁體中文)',
    Japanese = 'Japanese (日本語)',
    Korean = 'Korean (한국어)'
}

export const PREFERENCE_ICONS: Record<TravelPreference, string> = {
    [TravelPreference.Culture]: '🎏',
    [TravelPreference.Nature]: '🍀',
    [TravelPreference.Food]: '🍱',
    [TravelPreference.Leisure]: '🌇',
    [TravelPreference.Adventure]: '🪂',
    [TravelPreference.Arts]: '🎨'
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
    [SupportedLanguage.English]: 'English',
    [SupportedLanguage.Malay]: 'Malay (Bahasa Melayu)',
    [SupportedLanguage.Spanish]: 'Espanol',
    [SupportedLanguage.French]: 'Francais',
    [SupportedLanguage.German]: 'Deutsch',
    [SupportedLanguage.Italian]: 'Italiano',
    [SupportedLanguage.Czech]: 'Czech (Cestina)',
    [SupportedLanguage.SimplifiedChinese]: 'Simplified Chinese (简体中文)',
    [SupportedLanguage.TraditionalChinese]: 'Traditional Chinese (繁體中文)',
    [SupportedLanguage.Japanese]: 'Japanese (日本語)',
    [SupportedLanguage.Korean]: 'Korean (한국어)'
};

export const LANGUAGE_OPTIONS = Object.entries(SupportedLanguage).map(([key, value]) => ({
    value,
    label: LANGUAGE_LABELS[value as SupportedLanguage]
}));

export interface ComponentProps {
    [ComponentType.DatePicker]: {
        startDate?: string;
        endDate?: string;
        onDateChange: (startDate: string, endDate: string) => void;
    };
    [ComponentType.PreferenceSelector]: {
        selectedPreferences: TravelPreference[];
        onPreferenceChange: (preferences: TravelPreference[]) => void;
    };
    [ComponentType.BudgetSelector]: {
        selectedBudget?: BudgetLevel;
        onBudgetChange: (budget: BudgetLevel) => void;
    };
    [ComponentType.LanguageSelector]: {
        selectedLanguage?: SupportedLanguage;
        onLanguageChange: (language: SupportedLanguage) => void;
    };
    [ComponentType.PlaceCard]: {
        title: string;
        description: string;
        imageUrl: string;
        onClick?: () => void;
    };
    [ComponentType.TransportSelector]: {
        options: string[];
        onSelect: (option: string) => void;
    };
    [ComponentType.PlaceCarousel]: {
        items: Array<{
            title: string;
            description: string;
            imageUrl: string;
        }>;
    };
    [ComponentType.SavedPlacesList]: {
        places: Place[];
        onDelete: (placeId: string) => void;
    };
    [ComponentType.QuickResponse]: {
        responses: string[];
        onResponseSelect: (text: string) => void;
    };
}

export interface ComponentRegistration<T extends ComponentType> {
    component: React.ComponentType<ComponentProps[T]>;
    defaultProps?: Partial<ComponentProps[T]>;
}

export interface ComponentState {
    id: string;
    type: ComponentType;
    props: any;
    isVisible: boolean;
    order: number;
}

export interface ComponentTransition {
    id: string;
    from: Partial<ComponentState>;
    to: Partial<ComponentState>;
    duration?: number;
}

export interface ComponentUpdate {
    id: string;
    updates: Partial<ComponentState>;
}

export interface MessageData {
    toolName?: ComponentType;
    componentProps?: any;
}

export interface ChatMessage extends Omit<AiMessage, 'data'> {
    data?: MessageData;
}

export type ToolResponse<T extends ComponentType> = {
    type: T;
    props: ComponentProps[T];
    message?: string;
}

// Session Types
export interface TravelSession {
    // Session info
    sessionId: string;
    startTime: number;
    lastActive: number;
    expiresAt: number;
    
    // Travel details
    destination: string;
    startDate: string;
    endDate: string;
    preferences: string[];
    budget: string;
    language: string;
    transport?: string[];
    location?: {
        latitude: number;
        longitude: number;
    };
    
    // Places
    savedPlaces: any[];
    currentStage: number;
    
    // Metrics
    totalPrompts: number;
    stagePrompts: Record<number, number>;
    savedPlacesCount: number;
    
    // Payment
    isPaid: boolean;
    paymentReference: string;
    paymentTimestamp?: number;
}

export type ChatState = 'initial' | 'gathering_info' | 'planning' | 'interrupted' | 'completed';

export interface AIResponse {
    message: string;
    parameters?: TravelDetails;
    suggestedAction?: string;
    error?: string;
}

export interface CacheConfig {
    maxSize: number;
    ttl: number; // Time to live in milliseconds
}

export interface CacheEntry {
    content: string;
    timestamp: number;
    language: string;
}

export interface ContentResponse {
    content: string;
    cached: boolean;
    language: string;
    generated: Date;
}

export interface ToolInvocation {
    toolName: string;
    toolCallId: string;
    state: 'result' | 'pending' | 'error';  
    args: JSONValue;  
    result?: {
        type: string;
        props: Record<string, unknown>;  
    };
    error?: string;  
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';  
    content: string;
    createdAt?: Date;  
    data?: MessageData;
    toolInvocations?: ToolInvocation[];
    parentMessageId?: string;  
}

// Weather related types
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy' | 'windy' | 'partly-cloudy';

export interface WeatherData {
    date: string;
    precipitation: {
        total: number;
    };
    temperature: {
        max: number;
    };
}

export interface WeatherForecast {
    date: string;
    dayOfWeek: string;
    temperature: {
        current: number;
        max: number;
        min: number;
    };
    precipitation: {
        amount: number;
        probability: number;
    };
    condition: WeatherCondition;
    description: string;
    icon: string;
}

export interface WeatherHistoricalProps {
    lat: number;
    lon: number;
    city: string;
    startDate: string;
    endDate: string;
    units?: 'us' | 'uk' | 'metric';
    weatherData?: WeatherData[];
    historicalYear?: number;
    averages?: {
        maxTemp: number;
        precipitation: number;
    };
}

export interface WeatherForecastProps {
    lat: number;
    lon: number;
    city: string;
    startDate: string;
    endDate: string;
    units?: 'us' | 'uk' | 'metric';
    forecastData: WeatherForecast[];
    summary: {
        averageTemp: number;
        maxTemp: number;
        minTemp: number;
        precipitationDays: number;
        dominantCondition: WeatherCondition;
    };
}

export interface OpenWeatherDayResponse {
    lat: number;
    lon: number;
    tz: string;
    date: string;
    units: string;
    cloud_cover: {
        afternoon: number;
    };
    humidity: {
        afternoon: number;
    };
    precipitation: {
        total: number;
    };
    temperature: {
        min: number;
        max: number;
        afternoon: number;
        night: number;
        evening: number;
        morning: number;
    };
    pressure: {
        afternoon: number;
    };
    wind: {
        max: {
            speed: number;
            direction: number;
        }
    }
}

export interface WeatherResponse {
    data: OpenWeatherDayResponse;
    year: number;  // Add this field
    error?: string;
}

// Currency related types
export interface CurrencyRate {
    code: string;
    name: string;
    rate: number;
    symbol?: string;
}

export interface CurrencyConverterProps {
    baseCurrency?: string;
    baseAmount?: number;
    onAmountChange?: (amount: number) => void;
    defaultCurrencies?: string[];
    rates?: { [key: string]: number };
}

export interface CurrencyInfo {
    name: string;
    symbol: string;
    position: 'before' | 'after';
}

export const CURRENCY_INFO: { [key: string]: CurrencyInfo } = {
    'USD': { name: 'US Dollar', symbol: '$', position: 'before' },
    'EUR': { name: 'Euro', symbol: '€', position: 'before' },
    'GBP': { name: 'British Pound', symbol: '£', position: 'before' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', position: 'before' },
    'JPY': { name: 'Japanese Yen', symbol: '¥', position: 'before' },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$', position: 'before' },
    'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', position: 'before' },
    'KRW': { name: 'South Korean Won', symbol: '₩', position: 'before' },
    'AUD': { name: 'Australian Dollar', symbol: 'A$', position: 'before' },
    'CAD': { name: 'Canadian Dollar', symbol: 'C$', position: 'before' },
    'THB': { name: 'Thailand Baht', symbol: '฿', position: 'before' }
};

export interface CurrencyCache {
    timestamp: number;
    rates: Record<string, number>;
    baseCurrency: string;
}

export interface CurrencyApiResponse {
    data: { [key: string]: number };
}

export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

export type StageProgressResult =
| {
    type: 'stageProgress';
    status: 'success';
    props: {
        nextStage: number;
    };
}
| {
    type: 'stageProgress';
    status: 'error';
    props: {
        nextStage: number;
        error: string;
        upgradeRequired?: boolean;
    };
};
