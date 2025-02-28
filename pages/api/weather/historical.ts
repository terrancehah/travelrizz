import { NextRequest } from 'next/server';
import { WeatherResponse } from '@/managers/types';
import { 
  fetchHistoricalWeatherData, 
  isValidCoordinates, 
  isValidDateRange, 
  getPreviousYearDates 
} from '@/utils/weather-utils';

// Define types for the API response
interface ErrorResponse {
  error: string;
}

export const config = {
  runtime: 'edge'
};

export default async function handler(
  req: NextRequest
) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const units = searchParams.get('units') || 'metric';

    console.log('[historical] Original dates:', { startDate, endDate });

    // Validate parameters
    if (!lat || !lon || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    if (!isValidCoordinates(lat, lon)) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates' }),
        { status: 400 }
      );
    }

    const historicalDates = getPreviousYearDates(startDate, endDate);

    console.log('[historical] Historical dates:', historicalDates);

    if (!isValidDateRange(historicalDates.startDate, historicalDates.endDate)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date range for historical data' }),
        { status: 400 }
      );
    }

    try {
      // Use the utility function to fetch weather data
      const weatherData = await fetchHistoricalWeatherData(lat, lon, historicalDates.startDate, historicalDates.endDate, units);

      return new Response(JSON.stringify({
        data: weatherData.data,
        year: weatherData.year,
        averages: weatherData.averages
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof Error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('[Weather API Error]:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500 }
    );
  }
}
