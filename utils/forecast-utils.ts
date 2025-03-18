import { WeatherForecast, WeatherCondition } from '@/managers/types';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';


export function isWithinForecastRange(startDate: string, endDate: string): boolean {
    return true;
}

export function formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function mapWeatherCondition(condition: string): WeatherCondition {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
        return 'sunny';
    } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
        return 'cloudy';
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
        return 'rainy';
    } else if (lowerCondition.includes('snow') || lowerCondition.includes('flurr')) {
        return 'snowy';
    } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
        return 'stormy';
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist') || lowerCondition.includes('haze')) {
        return 'foggy';
    } else if (lowerCondition.includes('wind')) {
        return 'windy';
    } else {
        return 'partly-cloudy'; // Default fallback
    }
}


export async function fetchWeatherForecast(
    lat: number,
    lon: number,
    units: string = 'metric'
): Promise<{
    data: WeatherForecast[];
    summary: {
        averageTemp: number;
        maxTemp: number;
        minTemp: number;
        precipitationDays: number;
        dominantCondition: WeatherCondition;
    };
}> {
    const apiKey = process.env.VISUALCROSSING_API_KEY;
    if (!apiKey) {
        throw new Error('Missing VISUALCROSSING_API_KEY environment variable');
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate end date as 7 days from today
    const forecastEnd = new Date(today);
    forecastEnd.setDate(today.getDate() + 6); // +6 to include today for a total of 7 days
    
    // Format dates as YYYY-MM-DD for the API
    const formattedStartDate = today.toISOString().split('T')[0];
    const formattedEndDate = forecastEnd.toISOString().split('T')[0];
    
    // Build the API URL with more detailed parameters
    const url = `${BASE_URL}/${lat},${lon}/${formattedStartDate}/${formattedEndDate}?key=${apiKey}&unitGroup=${units}&include=days&elements=datetime,temp,tempmax,tempmin,precip,precipprob,conditions,description,icon`;
    
    console.log('[fetchWeatherForecast] Fetching from URL:', url.replace(apiKey, '[REDACTED]'));
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to our format
    const forecastData = data.days.map((day: any) => ({
        date: day.datetime,
        dayOfWeek: new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: {
            current: day.temp,
            max: day.tempmax,
            min: day.tempmin
        },
        precipitation: {
            amount: day.precip,
            probability: day.precipprob
        },
        condition: mapWeatherCondition(day.conditions),
        description: day.description,
        icon: day.icon
    }));
    
    // Calculate summary statistics
    const temperatures = data.days.map((day: any) => day.temp);
    const maxTemps = data.days.map((day: any) => day.tempmax);
    const minTemps = data.days.map((day: any) => day.tempmin);
    const precipDays = data.days.filter((day: any) => day.precipprob > 30).length;
    
    // Find the most common weather condition
    const conditions = data.days.map((day: any) => mapWeatherCondition(day.conditions));
    const conditionCounts = conditions.reduce((acc: Record<string, number>, condition: string) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});
    
    // Type assertion to help TypeScript understand the structure
    const entries = Object.entries(conditionCounts) as [WeatherCondition, number][];
    const dominantCondition = entries
    .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
        data: forecastData,
        summary: {
            averageTemp: parseFloat((temperatures.reduce((sum: number, temp: number) => sum + temp, 0) / temperatures.length).toFixed(1)),
            maxTemp: parseFloat(Math.max(...maxTemps).toFixed(1)),
            minTemp: parseFloat(Math.min(...minTemps).toFixed(1)),
            precipitationDays: precipDays,
            dominantCondition
        }
    };
}
