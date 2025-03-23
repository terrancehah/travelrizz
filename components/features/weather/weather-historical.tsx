///Users/terrancehah/Documents/terrancehah.com/components/weather/historical-weather-chart.tsx

'use client';

import { useState, useEffect } from "react"
import { Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { OpenWeatherDayResponse, WeatherHistoricalProps, WeatherResponse } from "@/managers/types"
import { cn } from "@/utils/cn"
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useLocalizedFont } from '@/hooks/useLocalizedFont'

interface ChartDataPoint {
    date: string;
    temp: number;
    precipitation: number;
}

export default function HistoricalWeatherChart({ lat, lon, city, startDate, endDate, units = 'metric' }: WeatherHistoricalProps) {
    const [weatherData, setWeatherData] = useState<ChartDataPoint[]>([]);
    const [historicalYear, setHistoricalYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const tComp = useTranslations('components');
    const { theme } = useTheme();
    const fonts = useLocalizedFont();
    
    
    // Remains largely unchanged, but ensure compatibility with the API response
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(
                    `/api/weather/historical?lat=${lat}&lon=${lon}&startDate=${startDate}&endDate=${endDate}&units=${units}`
                );
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch weather data');
                }
                
                const { data, year } = await response.json();
                const chartData = data.map((item: WeatherResponse) => ({
                    date: item.data.date,
                    temp: item.data.temperature.max,
                    precipitation: item.data.precipitation.total,
                }));
                
                setWeatherData(chartData);
                setHistoricalYear(year);
            } catch (err) {
                console.error('Weather chart error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load weather data');
            } finally {
                setLoading(false);
            }
        };
        
        if (lat && lon && startDate && endDate) {
            fetchWeather();
        }
    }, [lat, lon, startDate, endDate, units]);
    
    if (loading) return (
        <div className="w-[80%] max-w-lg mx-auto rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-4 bg-white dark:bg-slate-700">
        <CardHeader>
        <CardTitle className="text-gray-700 dark:text-gray-200">{tComp('weatherHistorical.title', { city: city })}</CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
        {tComp('weatherHistorical.subheading', { 
            startDate: startDate, 
            endDate: endDate
        })}
        </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="space-y-3">
        <div className="h-[200px] bg-gray-100 dark:bg-slate-700 animate-pulse rounded-lg" />
        </div>
        </CardContent>
        </div>
    );
    if (error) return (
        <div className="w-[80%] max-w-lg mx-auto rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-4 bg-white dark:bg-slate-800">
        <CardHeader>
        <CardTitle className={`${fonts.text} text-gray-700 dark:text-gray-200`}>{tComp('weatherHistorical.title', { city: city })}</CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
        {tComp('weatherHistorical.subheading', { 
            startDate: startDate, 
            endDate: endDate
        })}
        </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="text-red-500 dark:text-red-400">{error}</div>
        </CardContent>
        </div>
    );
    
    const tempUnit = units === 'us' ? '°F' : '°C';
    const precipUnit = 'mm';
    
    return (
        <div className="w-[80%] max-w-lg mx-auto rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-4 bg-white dark:bg-slate-800">
        <CardHeader>
        <CardTitle className={`${fonts.text} text-gray-700 dark:text-gray-200`}>{tComp('weatherHistorical.title', { city: city })}</CardTitle>
        <CardDescription className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400`}>
        {tComp('weatherHistorical.subheading', { 
            startDate: startDate, 
            endDate: endDate,
            year: historicalYear
        })}
        </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
        <ChartContainer
        config={{
            temp: {
                label: "Temperature",
                color: theme === 'dark' ? "rgb(56 189 248)" : "rgb(2 132 199)", // sky-400 for dark, sky-700 for light
            },
            precipitation: {
                label: "Precipitation",
                color: theme === 'dark' ? "rgb(71 85 105)" : "rgb(226 232 240)", // slate-600 for dark, slate-200 for light
            },
        }}
        className="h-[200px]"
        >
        <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
        data={weatherData}
        margin={{
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
        }}
        >
        <CartesianGrid 
        strokeDasharray="3 3" 
        opacity={0.5} 
        vertical={false} 
        stroke={theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)'} // slate-700 for dark, slate-200 for light
        />
        <XAxis 
        dataKey="date"
        axisLine={{ stroke: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)' }}
        tick={false}
        tickLine={false}
        />
        <YAxis className="text-xs"
        yAxisId="temp"
        orientation="left"
        tickFormatter={(value) => `${value}${tempUnit}`}
        domain={[0, 40]}
        ticks={[0, 10, 20, 30, 40]}
        tick={{ fill: theme === 'dark' ? 'rgb(148 163 184)' : 'rgb(100 116 139)' }} // slate-400 for dark, slate-500 for light
        axisLine={{ stroke: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)' }}
        tickLine={{ stroke: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)' }}
        />
        <YAxis className="text-xs"
        yAxisId="precipitation"
        orientation="right"
        tickFormatter={(value) => `${value}${precipUnit}`}
        domain={[0, 'auto']}
        tick={{ fill: theme === 'dark' ? 'rgb(148 163 184)' : 'rgb(100 116 139)' }}
        axisLine={{ stroke: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)' }}
        tickLine={{ stroke: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)' }}
        />
        <ChartTooltip />
        <Bar
        dataKey="precipitation"
        yAxisId="precipitation"
        fill={theme === 'dark' ? "rgb(51 65 85)" : "rgb(219 234 254)"} // slate-700 for dark, blue-100 for light
        opacity={0.7}
        barSize={40}
        />
        <Line
        type="natural"
        dataKey="temp"
        yAxisId="temp"
        stroke={theme === 'dark' ? "rgb(56 189 248)" : "rgb(2 132 199)"} // sky-400 for dark, sky-700 for light
        strokeWidth={3}
        dot={false}
        activeDot={false}
        isAnimationActive={false}
        connectNulls
        />
        </ComposedChart>
        </ResponsiveContainer>
        </ChartContainer>
        </CardContent>
        </div>
    );
}