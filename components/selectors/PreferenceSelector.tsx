import React from 'react';
import { TravelPreference, PREFERENCE_ICONS } from '../../managers/types';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { useTheme } from 'next-themes';

export interface PreferenceSelectorProps {
  currentPreferences?: TravelPreference[];
  onUpdate?: (preferences: TravelPreference[]) => void;
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({ 
  currentPreferences = [], 
  onUpdate 
}) => {
  const t = useTranslations('parameters');
  const fonts = useLocalizedFont();
  const { theme, setTheme } = useTheme();
  const [tempPreferences, setTempPreferences] = React.useState<TravelPreference[]>(() => {
    return currentPreferences || [];
  });

  // Update tempPreferences when currentPreferences changes
  React.useEffect(() => {
    console.log('Current preferences updated:', currentPreferences); // Debug log
    setTempPreferences(currentPreferences || []);
  }, [currentPreferences]);

  const handleConfirm = () => {
    onUpdate?.(tempPreferences);
  };

  const togglePreference = (preference: TravelPreference) => {
    setTempPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference);
      } else {
        return [...prev, preference];
      }
    });
  };

  const preferences = Object.values(TravelPreference);

  return (
    <div className="w-[80%] md:w-fit mx-auto max-w-[600px] bg-white rounded-3xl 
    border border-gray-100 dark:border-slate-500 shadow-md dark:shadow-slate-300 mt-4 mb-2">
      <div className="px-6 py-4 my-2">
        <h3 className={`text-lg ${fonts.text} font-semibold text-gray-700 mb-3`}>{t('preferences.selector.prompt')}</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {preferences.map(value => (
            <div 
              key={value}
              onClick={() => togglePreference(value)}
              className={`
                cursor-pointer flex align-middle text-left p-3 rounded-lg ${fonts.text} text-sm
                shadow-sm hover:shadow-md border hover:border-sky-400
                transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]
                ${tempPreferences.includes(value)
                  ? 'bg-light-blue hover:bg-blue-200/70 text-sky-blue hover:text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div className={`
                  min-w-4 h-4 rounded border flex items-center justify-center
                  ${tempPreferences.includes(value)
                    ? 'border-[#4798cc] bg-[#4798cc]'
                    : 'border-gray-300 bg-white'
                  }
                `}>
                  {tempPreferences.includes(value) && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span>{PREFERENCE_ICONS[value]}</span>
                <span>{t(`preferences.options.${value}`)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 bg-sky-blue/80 hover:bg-sky-blue/90 hover:scale-[1.02] active:scale-[0.98]
            text-gray-100 hover:text-white rounded-lg ${fonts.text} text-sm transition-colors duration-300`}
          >
            {t('preferences.selector.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
