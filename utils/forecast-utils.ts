import { WeatherForecast, WeatherCondition } from '@/managers/types';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * Checks if the travel dates are within the forecast range (next 7 days)
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Boolean indicating if dates are within forecast range
 */
export function isWithinForecastRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const today = new Date();
  
  // Set today to beginning of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  
  // Calculate 7 days from now
  const forecastLimit = new Date(today);
  forecastLimit.setDate(today.getDate() + 7);
  
  // Only check if start date is not before today, we'll always fetch 7 days of data
  return start >= today;
}

/**
 * Formats a date from DD/MM/YYYY to YYYY-MM-DD format
 * @param dateString Date in DD/MM/YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export function formatDate(dateString: string): string {
  const [day, month, year] = dateString.split('/').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Maps Visual Crossing weather condition to our internal weather condition type
 * @param condition Visual Crossing weather condition string
 * @returns Standardized weather condition
 */
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

/**
 * Fetches weather forecast data for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param startDate Start date in DD/MM/YYYY format
 * @param endDate End date in DD/MM/YYYY format
 * @param units Units (metric, us, uk)
 * @returns Weather forecast data
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
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
  const apiKey = process.env.NEXT_PUBLIC_VISUALCROSSING_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_VISUALCROSSING_API_KEY environment variable');
  }

  // Format dates from DD/MM/YYYY to YYYY-MM-DD
  const formattedStartDate = formatDate(startDate);
  
  // Calculate end date as 7 days from start date to always show a week of forecast
  const start = new Date(formattedStartDate);
  const forecastEnd = new Date(start);
  forecastEnd.setDate(start.getDate() + 6); // +6 to include the start date for a total of 7 days
  
  const formattedEndDate = forecastEnd.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  // Check if start date is within forecast range
  if (!isWithinForecastRange(formattedStartDate, formattedEndDate)) {
    throw new Error('Travel dates are outside the forecast range (next 7 days)');
  }

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
