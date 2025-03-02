import { WeatherResponse } from '@/managers/types';

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
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
        }

        // Check if start date is before end date
        if (start > end) {
            return false;
        }

        // Check if date range is not too long (e.g., more than 60 days)
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 60) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Fetches historical weather data for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param startDate Start date in DD/MM/YYYY format
 * @param endDate End date in DD/MM/YYYY format
 * @param units Units (metric, us, uk)
 * @returns Historical weather data
 */
export async function fetchHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    units: string = 'metric'
) {
    const formattedDates = formatDateRange(startDate, endDate);
    const response = await fetch(`/api/weather/historical?lat=${lat}&lon=${lon}&startDate=${formattedDates.startDate}&endDate=${formattedDates.endDate}&units=${units}`);
    
    if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
    }

    return await response.json();
}
