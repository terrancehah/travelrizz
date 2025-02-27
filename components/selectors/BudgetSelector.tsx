import React from 'react';
import { BudgetLevel } from '../../managers/types';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { useTheme } from 'next-themes';

export interface BudgetSelectorProps {
  currentBudget?: BudgetLevel;
  onUpdate?: (budget: BudgetLevel) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({ currentBudget, onUpdate }) => {
  const t = useTranslations('parameters');
  const fonts = useLocalizedFont();
  const { theme, setTheme } = useTheme();
  const budgetOptions = [
    BudgetLevel.Budget,
    BudgetLevel.Moderate,
    BudgetLevel.Luxury,
    BudgetLevel.UltraLuxury
  ];

  return (
    <div className="max-w-[80%] xl:w-fit flex mx-auto bg-white dark:bg-slate-800 rounded-3xl my-4
    border border-gray-100 dark:border-slate-500 shadow-md">
      <div className="p-6">
        <h3 className={`text-lg ${fonts.text} font-semibold text-gray-700 dark:text-gray-200 mb-3`}>{t('budget.selector.prompt')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {budgetOptions.map((value) => (
            <button
              key={value}
              onClick={() => onUpdate?.(value)}
              className={`
                px-4 py-3 rounded-lg ${fonts.text} text-sm shadow-md hover:shadow-lg border hover:border-sky-400
                transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]
                ${String(currentBudget) === String(value)
                  ? 'bg-light-blue hover:bg-blue-200/70 text-sky-blue hover:text-blue-600 shadow-sm dark:bg-sky-900 dark:hover:bg-sky-800 dark:text-sky-200'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:hover:text-gray-200'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium">{t(`budget.levels.${value}.label`)}</span>
                <span className="text-lg font-semibold">{t(`budget.levels.${value}.symbol`)}</span>
                <span className="text-sm opacity-75 text-center">{t(`budget.levels.${value}.description`)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
