'use client'

import { useState } from 'react'
import { Place } from '@/managers/types'
import { useTranslations } from 'next-intl'
import { useLocalizedFont } from '@/hooks/useLocalizedFont'

interface OptimizedItineraryProps {
  places: Place[]
  startDate: string
  endDate: string
  onAccept: () => void
  onReject: () => void
}

/**
 * Component to display optimized place arrangement with explanation
 * This is a placeholder component that will be implemented later
 */
export function OptimizedItinerary({ 
  places, 
  startDate,
  endDate, 
  onAccept, 
  onReject
}: OptimizedItineraryProps) {
  // State to track if user has made a choice
  const [hasChosen, setHasChosen] = useState(false)
  const tComponent = useTranslations('components')
  const font = useLocalizedFont()

  // Group places by day
  const placesByDay = places.reduce((acc, place) => {
    const dayIndex = place.dayIndex ?? 0
    if (!acc[dayIndex]) {
      acc[dayIndex] = []
    }
    acc[dayIndex].push(place)
    return acc
  }, {} as Record<number, Place[]>)

  // Sort places within each day by orderIndex
  Object.values(placesByDay).forEach(dayPlaces => {
    dayPlaces.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })

  // Get date for each day based on trip start date
  const getDayDate = (dayIndex: number) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + dayIndex)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle user choice
  const handleAccept = () => {
    setHasChosen(true);
    onAccept();
    // Dispatch event to trigger marker updates
    window.dispatchEvent(new CustomEvent('optimization-applied'));
  };

  const handleReject = () => {
    setHasChosen(true)
    onReject()
  }

  return (
    <div className="p-4 px-6 w-[90%] xl:w-[80%] mx-auto border border-gray-200 dark:border-slate-500 rounded-2xl bg-white dark:bg-gray-900 shadow-sm space-y-4 mt-4">
      {/* Header */}
      <div>
        <h3 className={`${font.text} text-lg font-semibold text-gray-900 dark:text-white`}>
          {tComponent('OptimizedItinerary.heading')}
        </h3>
        <p className={`${font.text} text-sm text-gray-500 dark:text-gray-400 mt-1`}>
          {tComponent('OptimizedItinerary.subheading')}
        </p>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {Object.entries(placesByDay).map(([dayIndex, dayPlaces]) => (
          <div 
            key={dayIndex}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden 
                      transition-all duration-300 hover:border-sky-500 dark:hover:border-sky-400"
          >
            {/* Day Header */}
            <div className="bg-slate-100 dark:bg-gray-800 px-4 py-3">
              <h4 className={`${font.text} font-medium text-gray-900 dark:text-white`}>
                {getDayDate(parseInt(dayIndex))}
              </h4>
            </div>

            {/* Places List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dayPlaces.map((place, index) => (
                <div 
                  key={place.id}
                  className="p-3 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Day Number */}
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center
                                  bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300
                                  rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {/* Place Name */}
                      <h5 className={`${font.text} text-gray-900 dark:text-white text-md font-medium truncate`}>
                        {typeof place.displayName === 'string' 
                          ? place.displayName 
                          : place.displayName?.text}
                      </h5>
                      {/* Place Type */}
                      <p className={`${font.text} text-sm text-gray-500 dark:text-gray-400 truncate`}>
                        {place.primaryTypeDisplayName?.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className={`${font.text} text-sm text-gray-500 dark:text-gray-400`}>
        {tComponent('OptimizedItinerary.disclaimer')}
      </p>

      {/* Action Buttons - Only show if user hasn't made a choice */}
      {!hasChosen && (
        <div className="flex justify-end space-x-3 pt-2 border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleReject}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                    dark:focus:ring-offset-gray-900"
          >
            Keep Original
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 
                    text-white rounded-md text-sm font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                    dark:focus:ring-offset-gray-900"
          >
            Apply Changes
          </button>
        </div>
      )}
    </div>
  )
}
