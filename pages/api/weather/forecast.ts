import { NextRequest } from 'next/server';
import { 
    fetchWeatherForecast, 
    formatDate 
} from '@/utils/forecast-utils';

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
        
        console.log('[forecast] Original dates:', { startDate, endDate });
        
        // Validate parameters
        if (!lat || !lon || !startDate || !endDate) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400 }
            );
        }
        
        try {
            // Use the utility function to fetch forecast data (always fetches 7 days from today)
            const forecastData = await fetchWeatherForecast(
                lat, 
                lon, 
                units
            );
            
            return new Response(JSON.stringify({
                data: forecastData.data,
                summary: forecastData.summary,
                isForecasting: true
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'max-age=1800' // Cache for 30 minutes
                }
            });
        } catch (error) {
            console.error('[forecast] Error fetching forecast data:', error);
            return new Response(
                JSON.stringify({ 
                    error: 'Error fetching forecast data',
                    isForecasting: false
                }),
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('[forecast] Error processing request:', error);
        return new Response(
            JSON.stringify({ error: 'Error processing request' }),
            { status: 500 }
        );
    }
}
