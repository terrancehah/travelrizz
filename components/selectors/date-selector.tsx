import React from 'react';
import { addDays } from 'date-fns';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { DayPicker as CalendarComponent, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';


export interface DatePickerProps {
  dates?: { startDate: string; endDate: string };
  onUpdate?: (dates: { startDate: string; endDate: string }) => void;
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({ dates, onUpdate, style }) => {
  const fonts = useLocalizedFont();
  const t = useTranslations('parameters');
  const { theme, setTheme } = useTheme()
  const [selected, setSelected] = React.useState<DateRange | undefined>();
  const [tempDates, setTempDates] = React.useState({
    startDate: '',
    endDate: ''
  });
  const [displayDates, setDisplayDates] = React.useState({
    startDate: '',
    endDate: ''
  });

  React.useEffect(() => {
    if (dates?.startDate && dates?.endDate) {
      setDisplayDates({
        startDate: dates.startDate,
        endDate: dates.endDate
      });
      setTempDates({
        startDate: dates.startDate,
        endDate: dates.endDate
      });
      setSelected({
        from: new Date(dates.startDate),
        to: new Date(dates.endDate)
      });
    }
  }, [dates]);

  const handleConfirm = () => {
    if (tempDates.startDate && tempDates.endDate) {
      setDisplayDates(tempDates);
      onUpdate?.(tempDates);
    }
  };

  return (
    <div className="w-[80%] md:w-fit mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-500 shadow-md mt-2">
      <div className="w-min px-6 py-6">
        <h3 className={`text-lg ${fonts.text} font-semibold text-gray-700 dark:text-gray-200 mb-3`}>{t('dates.selector.prompt')}</h3>
        
        {/* Date display box
        <div className={`mb-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-center ${fonts.text} text-gray-700 dark:text-gray-200`}>
          {(tempDates.startDate && tempDates.endDate) || (displayDates.startDate && displayDates.endDate) ? (
            <>
              <span>{tempDates.startDate || displayDates.startDate}</span>
              <span className="mx-2">→</span>
              <span>{tempDates.endDate || displayDates.endDate}</span>
            </>
          ) : (
            <span>Select your travel dates</span>
          )}
        </div> */}

        <div className="flex flex-col items-center space-y-4">
          <CalendarComponent
            style={{
              '--rdp-accent-color': 'rgb(232 244 255)', // sky-400 for light mode
              '--rdp-background-color': 'white',
              '--rdp-accent-background-color': 'rgba(125, 211, 252, 0.2)',
              '--rdp-day_button-border-radius': '6px',
              '--rdp-selected-border': 'none',
              '--rdp-today-color': 'rgb(3 105 161)', // sky-700 for light mode
              '--rdp-range_start-date-background-color': 'rgb(74 136 198)', // sky-blue
              '--rdp-range_end-date-background-color': 'rgb(74 136 198)',
              '--rdp-disabled-opacity': '0.25'
            } as React.CSSProperties}
            mode="range"
            min={1}
            max={5}
            disabled={(date) => {
              const today = new Date(new Date().setHours(0,0,0,0));
              // Always disable past dates
              if (date < today) return true;
              
              // If we have a start date selected but no end date yet
              if (selected?.from && !selected.to) {
                const startDate = new Date(selected.from);
                const maxDate = new Date(startDate);
                maxDate.setDate(startDate.getDate() + 4);
                
                // During end date selection, disable dates out of range
                return date < startDate || date > maxDate;
              }
              
              // If both dates are selected or no dates selected, only disable past dates
              return false;
            }}
            selected={selected}
            defaultMonth={new Date()}
            fromDate={new Date()}
            onSelect={(range: DateRange | undefined) => {
              setSelected(range);
              // TypeScript type guard to ensure dates are defined
              if (range && 'from' in range && 'to' in range && range.from && range.to) {
                const formatDate = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };

                const newStartDate = formatDate(range.from);
                const newEndDate = formatDate(range.to);
                
                setTempDates({
                  startDate: newStartDate,
                  endDate: newEndDate
                });
              }
            }}
            className={`${fonts.text}`}
            classNames={{
              caption_label: "pl-3 my-auto",
              nav_button: cn(
                "bg-transparent opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-300"
              ),
              head_cell: "text-gray-500 dark:text-gray-400",
              cell: "[&:has([aria-selected])]:bg-sky-50 dark:[&:has([aria-selected])]:bg-sky-900/20 [&:has([aria-selected])]:rounded-md",
              day: "aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300 rounded-md",
              day_selected: "bg-sky-400/10 text-sky-600 hover:bg-sky-500/20 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 dark:bg-sky-500/10 dark:hover:bg-sky-500/20",
            }}
            components={{
              PreviousMonthButton: (props) => (
                <button {...props} className={cn(props.className)}>
                  <ChevronLeft className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" />
                </button>
              ),
              NextMonthButton: (props) => (
                <button {...props} className={cn(props.className)}>
                  <ChevronRight className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" />
                </button>
              )
            }}
          />
          
          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!tempDates.startDate || !tempDates.endDate}
            className={cn(
              `w-full py-2 px-4 rounded-md text-white ${fonts.text} font-medium transition-colors duration-200 
              hover:scale-[1.02] active:scale-[0.98]`,
              tempDates.startDate && tempDates.endDate
                ? "bg-sky-blue/70 hover:bg-sky-blue dark:bg-sky-700 dark:hover:bg-sky-500 text-gray-100 hover:text-white "
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {t('dates.selector.confirmbutton')}
          </button>
        </div>
      </div>
    </div>
  );
};
