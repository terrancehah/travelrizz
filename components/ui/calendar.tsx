// components/ui/calendar.tsx
"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex space-x-4",
        month: "space-y-3",
        caption: "flex justify-center relative items-center h-9",
        caption_label: "text-base font-medium text-gray-900 dark:text-gray-100",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md inline-flex items-center justify-center",
        ),
        nav_button_previous: "left-1",
        nav_button_next: "right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 rounded-md"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: 
          "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white dark:bg-blue-600 dark:hover:bg-blue-700",
        day_today: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        day_outside: 
          "text-gray-400 dark:text-gray-500 opacity-50 aria-selected:bg-blue-100/50 dark:aria-selected:bg-blue-900/20",
        day_disabled: "text-gray-400 dark:text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-blue-50 aria-selected:text-gray-900 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (props) => (
          <button {...props} className={cn(props.className)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
        ),
        NextMonthButton: (props) => (
          <button {...props} className={cn(props.className)}>
            <ChevronRight className="h-4 w-4" />
          </button>
        )
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }