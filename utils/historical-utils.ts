import { WeatherResponse } from '@/managers/types';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Centralized date parsing function
export function parseDate(dateStr: string): Date {
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d); // Months are 0-based
    } else if (dateStr.includes('-')) {
        return new Date(dateStr);
    }
    throw new Error('Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD');
}

export function formatDateRange(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const extraDays = Math.max(0, 30 - daysDiff);
    const daysToAddBefore = Math.floor(extraDays / 2);
    const daysToAddAfter = extraDays - daysToAddBefore;
    
    start.setDate(start.getDate() - daysToAddBefore);
    end.setDate(end.getDate() + daysToAddAfter);
    
    const extendedStartDate = start.toISOString().split('T')[0];
    const extendedEndDate = end.toISOString().split('T')[0];
    
    console.log('[formatDateRange]', {
        originalStartDate: startDate,
        originalEndDate: endDate,
        formattedStartDate: extendedStartDate,
        formattedEndDate: extendedEndDate,
        totalDays: 30,
        originalRange: daysDiff,
        addedBefore: daysToAddBefore,
        addedAfter: daysToAddAfter,
    });
    
    return {
        startDate: extendedStartDate,
        endDate: extendedEndDate,
        originalRange: daysDiff,
        addedBefore: daysToAddBefore,
        addedAfter: daysToAddAfter,
    };
}

export function getPreviousYearDates(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    start.setFullYear(start.getFullYear() - 1);
    end.setFullYear(end.getFullYear() - 1);
    
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        year: start.getFullYear(),
    };
}

export function isValidCoordinates(lat: number, lon: number) {
    return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function isValidDateRange(startDate: string, endDate: string) {
    try {
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return false;
        }
        
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 60;
    } catch {
        return false;
    }
}

// Remove unused fetchHistoricalWeather function

export function processHistoricalData(rawData: any) {
    const days = rawData.days;
    const data = days.map((day: any) => ({
        data: {
            date: new Date(day.datetime).toLocaleDateString('en-GB'),
            temperature: { max: day.tempmax },
            precipitation: { total: day.precip || 0 }, // Handle null/undefined precip
        },
    }));
    const maxTempAvg = days.reduce((sum: number, day: any) => sum + day.tempmax, 0) / days.length;
    const precipTotal = days.reduce((sum: number, day: any) => sum + (day.precip || 0), 0);
    
    return {
        data,
        year: new Date(days[0].datetime).getFullYear(),
        averages: {
            maxTemp: parseFloat(maxTempAvg.toFixed(1)),
            precipitation: parseFloat(precipTotal.toFixed(1)),
        },
    };
}

export async function fetchHistoricalWeatherData(lat: number, lon: number, startDate: string, endDate: string, units: string) {
    const apiKey = process.env.VISUALCROSSING_API_KEY;
    if (!apiKey) throw new Error('Missing API key');
    
    const { startDate: apiStart, endDate: apiEnd } = formatDateRange(startDate, endDate);
    const url = `${BASE_URL}/${lat},${lon}/${apiStart}/${apiEnd}?key=${apiKey}&unitGroup=${units}&include=days`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
    return response.json();
}