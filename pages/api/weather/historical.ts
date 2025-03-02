import { NextRequest } from 'next/server';
import { WeatherResponse } from '@/managers/types';
import { 
  isValidCoordinates, 
  isValidDateRange, 
  getPreviousYearDates 
} from '@/utils/historical-utils';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

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
      const apiKey = process.env.NEXT_PUBLIC_VISUALCROSSING_API_KEY;
      if (!apiKey) {
          throw new Error('Missing NEXT_PUBLIC_VISUALCROSSING_API_KEY environment variable');
      }

      const url = `${BASE_URL}/${lat},${lon}/${historicalDates.startDate}/${historicalDates.endDate}?key=${apiKey}&unitGroup=${units}&include=days&elements=datetime,tempmax,precip`;
      
      console.log('[historical] Fetching from URL:', url.replace(apiKey, '[REDACTED]'));

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

      // Calculate averages
      const maxTemps = data.days.map((day: any) => day.tempmax);
      const precipitations = data.days.map((day: any) => day.precip);
      
      const averageMaxTemp = maxTemps.reduce((sum: number, temp: number) => sum + temp, 0) / maxTemps.length;
      const totalPrecipitation = precipitations.reduce((sum: number, precip: number) => sum + precip, 0);

      return new Response(JSON.stringify({
        data: weatherData,
        year: historicalDates.year,
        averages: {
            maxTemp: parseFloat(averageMaxTemp.toFixed(1)),
            precipitation: parseFloat(totalPrecipitation.toFixed(1))
        }
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
