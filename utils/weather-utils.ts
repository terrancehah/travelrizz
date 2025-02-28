import { WeatherResponse } from '@/managers/types';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * Formats a date range from DD/MM/YYYY format to YYYY-MM-DD and extends it to 30 days if needed
 * @param startDate Start date in DD/MM/YYYY format
 * @param endDate End date in DD/MM/YYYY format
 * @returns Formatted date range with extended dates if needed
 */
export function formatDateRange(startDate: string, endDate: string) {
    // Parse DD/MM/YYYY dates
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
    
    // Format dates for API (YYYY-MM-DD)
    const formattedStartDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const formattedEndDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    // Calculate number of days in the range
    const start = new Date(formattedStartDate);
    const end = new Date(formattedEndDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate how many extra days we need for 30 days total
    const extraDays = Math.max(0, 30 - daysDiff);
    const daysToAddBefore = Math.floor(extraDays / 2);
    const daysToAddAfter = extraDays - daysToAddBefore;

    // Extend dates to get 30 days
    start.setDate(start.getDate() - daysToAddBefore);
    end.setDate(end.getDate() + daysToAddAfter);

    // Format extended dates for API
    const extendedStartDate = start.toISOString().split('T')[0];
    const extendedEndDate = end.toISOString().split('T')[0];

    console.log('[formatDateRange] Date conversion:', {
        originalStartDate: startDate,
        originalEndDate: endDate,
        formattedStartDate: extendedStartDate,
        formattedEndDate: extendedEndDate,
        totalDays: 30,
        originalRange: daysDiff,
        addedBefore: daysToAddBefore,
        addedAfter: daysToAddAfter
    });

    return {
        startDate: extendedStartDate,
        endDate: extendedEndDate,
        originalRange: daysDiff,
        addedBefore: daysToAddBefore,
        addedAfter: daysToAddAfter
    };
}

/**
 * Helper function to get dates from previous year
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Previous year dates and year
 */
export function getPreviousYearDates(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Subtract one year from each date separately
    start.setFullYear(start.getFullYear() - 1);
    end.setFullYear(end.getFullYear() - 1);

    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        year: start.getFullYear() // Use start date's year for display
    };
}

/**
 * Validates if the coordinates are valid
 * @param lat Latitude
 * @param lon Longitude
 * @returns Boolean indicating if coordinates are valid
 */
export function isValidCoordinates(lat: number, lon: number) {
    return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Validates if the date range is valid
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Boolean indicating if date range is valid
 */
export function isValidDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const minDate = new Date('1970-01-01');  // Visual Crossing supports data from 1970
    const maxDate = new Date(); // Current date since we're using historical data

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
    }

    return (
        start >= minDate &&
        end <= maxDate &&
        start <= end &&
        daysDiff <= 31  // Allow up to 31 days
    );
}

/**
 * Fetches historical weather data for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param units Units (metric, us, uk)
 * @returns Weather data and metadata
 */
export async function fetchHistoricalWeatherData(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    units: string = 'metric'
): Promise<{
    data: WeatherResponse[];
    year: number;
    averages: {
        maxTemp: number;
        precipitation: number;
    };
}> {
    const apiKey = process.env.NEXT_PUBLIC_VISUALCROSSING_API_KEY;
    if (!apiKey) {
        throw new Error('Missing NEXT_PUBLIC_VISUALCROSSING_API_KEY environment variable');
    }

    // Get dates from previous year for historical data
    const historicalDates = getPreviousYearDates(startDate, endDate);
    
    console.log('[fetchHistoricalWeatherData] Historical dates:', historicalDates);

    // Validate parameters
    if (!isValidCoordinates(lat, lon)) {
        throw new Error('Invalid coordinates');
    }

    if (!isValidDateRange(historicalDates.startDate, historicalDates.endDate)) {
        throw new Error('Invalid date range for historical data');
    }

    const url = `${BASE_URL}/${lat},${lon}/${historicalDates.startDate}/${historicalDates.endDate}?key=${apiKey}&unitGroup=${units}&include=days&elements=datetime,tempmax,precip`;
    
    console.log('[fetchHistoricalWeatherData] Fetching from URL:', url.replace(apiKey, '[REDACTED]'));

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const weatherData = data.days.map((day: any) => ({
        data: {
            date: day.datetime,
            temperature: {
                max: day.tempmax
            },
            precipitation: {
                total: day.precip
            }
        }
    }));

    // Calculate averages for AI to reference
    const maxTemps = data.days.map((day: any) => day.tempmax);
    const precipitations = data.days.map((day: any) => day.precip);
    
    const averageMaxTemp = maxTemps.reduce((sum: number, temp: number) => sum + temp, 0) / maxTemps.length;
    const totalPrecipitation = precipitations.reduce((sum: number, precip: number) => sum + precip, 0);

    return {
        data: weatherData,
        year: historicalDates.year,
        averages: {
            maxTemp: parseFloat(averageMaxTemp.toFixed(1)),
            precipitation: parseFloat(totalPrecipitation.toFixed(1))
        }
    };
}
