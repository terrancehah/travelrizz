import React from 'react';
import { WeatherForecastProps, WeatherCondition } from '@/managers/types';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  CloudFog, 
  Wind, 
  CloudSun 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

/**
 * Component to display weather forecast for upcoming travel dates
 * Always shows 7 days of forecast data regardless of travel dates
 */
const WeatherForecast: React.FC<WeatherForecastProps> = ({
  city,
  forecastData,
  summary,
  startDate,
  endDate
}) => {
  const { theme } = useTheme();
  const tComp = useTranslations('components');
  const fonts = useLocalizedFont();

  // Map weather conditions to Lucide icons with appropriate colors
  const getWeatherIcon = (condition: WeatherCondition) => {
    const iconSize = 24;
    const getIconColor = () => {
      switch (condition) {
        case 'sunny':
          return theme === 'dark' ? "text-yellow-400" : "text-yellow-500";
        case 'cloudy':
          return theme === 'dark' ? "text-gray-400" : "text-gray-500";
        case 'rainy':
          return theme === 'dark' ? "text-sky-300" : "text-sky-500";
        case 'snowy':
          return theme === 'dark' ? "text-blue-200" : "text-blue-300";
        case 'stormy':
          return theme === 'dark' ? "text-purple-400" : "text-purple-500";
        case 'foggy':
          return theme === 'dark' ? "text-gray-300" : "text-gray-400";
        case 'windy':
          return theme === 'dark' ? "text-teal-400" : "text-teal-500";
        case 'partly-cloudy':
          return theme === 'dark' ? "text-gray-300" : "text-gray-400";
        default:
          return theme === 'dark' ? "text-yellow-400" : "text-yellow-500";
      }
    };
    
    const iconProps = { size: iconSize, className: getIconColor() };
    
    switch (condition) {
      case 'sunny':
        return <Sun {...iconProps} />;
      case 'cloudy':
        return <Cloud {...iconProps} />;
      case 'rainy':
        return <CloudRain {...iconProps} />;
      case 'snowy':
        return <Snowflake {...iconProps} />;
      case 'stormy':
        return <CloudLightning {...iconProps} />;
      case 'foggy':
        return <CloudFog {...iconProps} />;
      case 'windy':
        return <Wind {...iconProps} />;
      case 'partly-cloudy':
        return <CloudSun {...iconProps} />;
      default:
        return <Sun {...iconProps} />;
    }
  };

  // Format temperature based on units
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}°`;
  };

  // Format precipitation probability
  const formatPrecipProb = (prob: number) => {
    return `${Math.round(prob)}%`;
  };

  // Format date range for display
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const formattedStartDate = startDate ? dateFormatter.format(new Date(startDate)) : '';
  const formattedEndDate = endDate ? dateFormatter.format(new Date(endDate)) : '';

  return (
    <div className="w-[80%] xl:w-fit mx-auto rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-4 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className={`${fonts.text} text-gray-700 dark:text-gray-200`}>
          {tComp('weatherForecast.title', { city }) || `Weather Forecast for ${city}`}
        </CardTitle>
        <CardDescription className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400`}>
          {tComp('weatherForecast.subheading', { 
            startDate: formattedStartDate,
            endDate: formattedEndDate
          }) || `from ${formattedStartDate} to ${formattedEndDate}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Summary section with current temperature and conditions */}
        <div className="flex items-center mb-4 p-4 bg-sky-50 dark:bg-slate-700 rounded-xl">
          <div className="text-4xl font-bold mr-4 text-sky-600 dark:text-sky-300">
            {formatTemp(summary.averageTemp)}
          </div>
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              High: <span className="font-medium text-sky-600 dark:text-sky-300">{formatTemp(summary.maxTemp)}</span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Low: <span className="font-medium text-sky-600 dark:text-sky-300">{formatTemp(summary.minTemp)}</span>
            </div>
          </div>
          <div className="ml-auto">
            {React.cloneElement(getWeatherIcon(summary.dominantCondition), { size: 36 })}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {summary.precipitationDays === 0 
            ? tComp('weatherForecast.precipitation.none') || 'No precipitation expected'
            : summary.precipitationDays === 1
              ? tComp('weatherForecast.precipitation.some', { days: summary.precipitationDays }) || `${summary.precipitationDays} day with precipitation expected`
              : tComp('weatherForecast.precipitation.multiple', { days: summary.precipitationDays }) || `${summary.precipitationDays} days with precipitation expected`
          }
        </div>
        
        {/* Daily forecast cards */}
        <div className="overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {forecastData.map((day, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl
                          ${index === 0 ? 'bg-sky-50 dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-700/50'}
                          border-2 ${index === 0 ? 'border-sky-200 dark:border-sky-800' : 'border-gray-200 dark:border-slate-600'}
                          transition-colors duration-200`}
              >
                <div className={`${fonts.text} font-semibold text-gray-700 dark:text-gray-200`}>
                  {day.dayOfWeek}
                </div>
                <div className={`${fonts.text} text-xs text-gray-500 dark:text-gray-400`}>
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="my-3">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className={`${fonts.text} text-sm font-medium text-gray-700 dark:text-gray-200`}>
                  {formatTemp(day.temperature.max)}
                </div>
                <div className={`${fonts.text} text-xs text-gray-500 dark:text-gray-400`}>
                  {formatTemp(day.temperature.min)}
                </div>
                {day.precipitation.probability > 20 && (
                  <div className="mt-2 flex items-center text-xs text-sky-500 dark:text-sky-400">
                    <CloudRain size={14} className="mr-1" />
                    {formatPrecipProb(day.precipitation.probability)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600 text-sm text-gray-500 dark:text-gray-400">
          <p className={fonts.text}>
            {tComp('weatherForecast.footer', { city }) || `Weather data is subject to change.`}
          </p>
        </div>
      </CardContent>
    </div>
  );
};

export default WeatherForecast;
