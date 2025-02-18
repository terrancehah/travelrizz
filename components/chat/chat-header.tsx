import { ChevronDownIcon, ChevronUpIcon, CalendarDays, Languages, WandSparkles, CircleDollarSign } from 'lucide-react';
import { useTheme } from "next-themes"
import { useLocalizedFont } from "@/hooks/useLocalizedFont"
import { useTranslations } from 'next-intl';
import { TravelPreference } from '../../managers/types';
import React from 'react';

interface ChatHeaderProps {
  currentDetails: {
    destination: string;
    startDate: string;
    endDate: string;
    language: string;
    preferences?: string[];
    budget?: string;
  };
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const ChatHeader = ({ currentDetails, isCollapsed, setIsCollapsed }: ChatHeaderProps) => {
  const t = useTranslations('travelChat');
  const tParams = useTranslations('parameters');
  const fonts = useLocalizedFont()
  
  return (
    <div className="w-full bg-light-blue/60 dark:bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-light-blue/80 dark:supports-[backdrop-filter]:bg-gray-900/80
    border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-400 mx-auto py-2 px-6 relative">
        <div className={`transition-all duration-400 ease-in-out ${isCollapsed ? 'max-h-12' : 'max-h-[500px]'}`}>
          <h1 className={`${fonts.heading} font-semibold text-foreground text-2xl text-primary dark:text-white transition-colors duration-400 ${isCollapsed ? 'mb-0' : 'mb-2'}`}>
            {t('chatHeader.tripTo')} <span className="font-caveat">{currentDetails.destination}</span>
          </h1>

          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
              
              {/* Date */}
              <div>
                <div className={`${fonts.text} flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1 text-primary dark:text-white transition-colors duration-400`}>
                  <CalendarDays className="h-5 w-5" />
                  {t('chatHeader.date')}
                  </div>
                <div className={`${fonts.text} text-foreground text-sm text-primary dark:text-white transition-colors duration-400`}>{currentDetails.startDate} - {currentDetails.endDate}</div>
              </div>

              {/* Language */}
              <div>
                <div className={`${fonts.text} flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1 text-primary dark:text-white transition-colors duration-400`}>
                  <Languages className="h-5 w-5" />
                  {t('chatHeader.language')}
                  </div>
                <div className={`${fonts.text} text-foreground text-sm text-primary dark:text-white transition-colors duration-400`}>{currentDetails.language}</div>
              </div>

              {/* Preferences */}
              <div>
                <div className={`${fonts.text} flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1 text-primary dark:text-white transition-colors duration-400`}>
                  <WandSparkles className="h-5 w-5" />
                  {t('chatHeader.preferences')}
                </div>
                <div className={`${fonts.text} text-foreground text-sm text-primary dark:text-white transition-colors duration-400`}>
                  {currentDetails.preferences 
                    ? currentDetails.preferences
                        .map(pref => tParams(`preferences.options.${pref}`))
                        .join(', ')
                    : '-'
                  }
                </div>
              </div>

              {/* Budget */}
              <div>
                <div className={`${fonts.text} flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1 text-primary dark:text-white transition-colors duration-400`}>
                  <CircleDollarSign className="h-5 w-5" />
                  {t('chatHeader.budget')}
                </div>
                <div className={`${fonts.text} text-foreground text-sm text-primary dark:text-white transition-colors duration-400`}>
                  {currentDetails.budget 
                    ? `${tParams(`budget.levels.${currentDetails.budget}.label`)}`
                    : '-'
                  }
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-2 py-0.5 mb-2 text-secondary hover:text-primary bg-sky-200/80 hover:bg-sky-200 dark:bg-blue-800/80 dark:hover:bg-blue-800  dark:text-sky-100  transition-colors rounded-full duration-200 focus:outline-none"
          aria-label={isCollapsed ? 'Expand header' : 'Collapse header'}
        >
          {isCollapsed ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
        </button>
    </div>
  );
};
