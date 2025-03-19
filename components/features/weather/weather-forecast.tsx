import React from 'react';
import { WeatherForecastProps, WeatherCondition } from '@/managers/types';
import { 
  Sun, 
  Cloudy, 
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
    const iconSize = 32;
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
        return <Cloudy {...iconProps} />;
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

  // Add this helper function at the top with other functions
  const getTemperatureColor = (temp: number) => {
    if (temp >= 40) return 'text-red-500 dark:text-red-400';
    if (temp <= 10) return 'text-sky-500 dark:text-sky-400';
    return 'text-gray-700 dark:text-gray-200';
  };

  return (
    <div className="w-fit mx-auto p-4 px-6 rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-4 bg-white dark:bg-slate-800">
      
      {/* City title and subheading */}
      <div className="p-0 mb-2">
        <h2 className={`${fonts.text} font-semibold text-lg text-gray-700 dark:text-gray-200`}>
          {tComp('weatherForecast.title', { city })}
        </h2>
        <p className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400`}>
          {tComp('weatherForecast.subheading')}
        </p>
      </div>

      <div className="p-4 bg-sky-100/70 dark:bg-slate-700 rounded-xl">

        {/* Today's weather section */}
        <div className="flex flex-row items-center border-b pb-4 border-gray-400 dark:border-slate-500">
          <div className="flex flex-col gap-y-1 w-full md:mx-2">
            {/* Today's Heading */}
            <h3 className={`${fonts.text} font-medium text-lg text-gray-700 dark:text-gray-200`}>
              {tComp('weatherForecast.today.title')}
            </h3>

            <div className="flex flex-row justify-normal">

              {/* Today's Temps */}
              <div className={`text-4xl md:text-5xl font-semibold mr-4 my-auto ${getTemperatureColor(forecastData[0].temperature.current)}`}>
                {formatTemp(forecastData[0].temperature.current)}
              </div>

              {/* High and Low */}
              <div className="text-sm text-gray-700 dark:text-gray-300 flex flex-col w-full my-auto">
                <span className={`font-medium ${getTemperatureColor(forecastData[0].temperature.max)}`}>{tComp('weatherForecast.today.high')}: {formatTemp(forecastData[0].temperature.max)}</span>
                <span className={`font-medium ${getTemperatureColor(forecastData[0].temperature.min)}`}>{tComp('weatherForecast.today.low')}: {formatTemp(forecastData[0].temperature.min)}</span>
              </div>

              {/* Weather's Icon */}
              <div className="ml-auto md:mr-2">
                {React.cloneElement(getWeatherIcon(forecastData[0].condition), { size: 52 })}
              </div>
            </div>
          </div>

          
        </div>

        {/* Daily forecast sections - show next 6 days */}
        <div className="flex flex-col md:flex-row md:justify-between md:gap-x-2">
          {forecastData.slice(1).map((day, index) => (
            <div 
              key={index} 
              className={`flex items-center md:w-[80px] md:flex-col md:items-center md:flex-1 pt-3
                ${index !== forecastData.slice(1).length - 1 ? 'border-b md:border-b-0 border-gray-400 dark:border-slate-500 pb-3 md:pb-2' : 'pb-0'}`}
            >
              {/* Mobile: Date/Day | Icon | Temps | Rain */}
              {/* Desktop: Date/Day > Icon > Temps > Rain */}
              <div className="flex flex-1 items-center gap-x-5 md:flex-col md:items-center md:gap-y-2">
                {/* Date and Day */}
                <div className={`${fonts.text} xl:min-w-[80px] min-w-[50px] md:text-center`}>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {day.dayOfWeek}
                  </p>
                </div>

                {/* Weather Icon */}
                <div className="md:my-1">
                  {getWeatherIcon(day.condition)}
                </div>

                {/* Temperature */}
                <div className={`${fonts.text} text-sm md:text-center`}>
                  <p className={`font-medium ${getTemperatureColor(day.temperature.max)}`}>
                    {formatTemp(day.temperature.max)}
                  </p>
                  <p className={getTemperatureColor(day.temperature.min)}>
                    {formatTemp(day.temperature.min)}
                  </p>
                </div>

                {/* Precipitation - if exists */}
                {day.precipitation.probability > 20 && (
                  <div className="flex items-center text-xs text-sky-500 dark:text-sky-400 md:mt-1">
                    <CloudRain size={14} className="mr-1" />
                    {formatPrecipProb(day.precipitation.probability)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precipitation summary section */}
      <div className={`${fonts.text} text-sm text-gray-700 dark:text-gray-200 pt-3 pb-1`}>
        {summary.precipitationDays === 0 
            ? tComp('weatherForecast.precipitation.none')
            : summary.precipitationDays === 1
              ? tComp('weatherForecast.precipitation.some', { days: summary.precipitationDays })
              : tComp('weatherForecast.precipitation.multiple', { days: summary.precipitationDays })
        }
      </div>

      {/* Disclaimer section */}
      <div className="text-sm text-gray-700 dark:text-gray-200">
        <p className={fonts.text}>
          {tComp('weatherForecast.footer')}
        </p>
      </div>
    </div>
  );
};

export default WeatherForecast;
