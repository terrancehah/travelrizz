import React from 'react';
import { BudgetLevel } from '../../managers/types';
import { useTranslations } from 'next-intl';

export interface BudgetSelectorProps {
  currentBudget?: BudgetLevel;
  onUpdate?: (budget: BudgetLevel) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({ currentBudget, onUpdate }) => {
  const t = useTranslations('parameters');
  
  const budgetOptions = [
    BudgetLevel.Budget,
    BudgetLevel.Moderate,
    BudgetLevel.Luxury,
    BudgetLevel.UltraLuxury
  ];

  return (
    <div className="w-fit flex mx-auto max-w-[600px] bg-white rounded-3xl border border-gray-100 shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-raleway font-semibold text-gray-700 mb-3">{t('budget.selector.prompt')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {budgetOptions.map((value) => (
            <button
              key={value}
              onClick={() => onUpdate?.(value)}
              className={`
                px-4 py-3 rounded-lg font-raleway text-sm shadow-md hover:shadow-lg border hover:border-sky-400
                transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]
                ${currentBudget === value
                  ? 'bg-sky-400 bg-opacity-20 text-[#4798cc] shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium">{t(`budget.levels.${value}.label`)}</span>
                <span className="text-xs opacity-75 text-center">{t(`budget.levels.${value}.description`)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
