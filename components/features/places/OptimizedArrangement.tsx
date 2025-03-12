'use client'

import { useState, useEffect } from 'react'
import { Place } from '@/managers/types'

interface OptimizedArrangementProps {
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
export function OptimizedArrangement({ 
  places, 
  startDate,
  endDate, 
  onAccept, 
  onReject
}: OptimizedArrangementProps) {
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

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Optimized Itinerary
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={onReject}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded text-sm
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Keep Original
          </button>
          <button 
            onClick={onAccept}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 
                       text-white rounded text-sm transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* Explanation
      <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {explanation}
        </p>
      </div> */}

      {/* Days */}
      <div className="space-y-4">
        {Object.entries(placesByDay).map(([dayIndex, dayPlaces]) => (
          <div 
            key={dayIndex}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-slate-100 dark:bg-gray-800 px-4 py-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {getDayDate(parseInt(dayIndex))}
              </h4>
            </div>

            {/* Places List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dayPlaces.map((place, index) => (
                <div 
                  key={place.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                                 bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300
                                   rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="text-gray-900 dark:text-white font-medium">
                        {typeof place.displayName === 'string' 
                          ? place.displayName 
                          : place.displayName?.text}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {place.primaryType?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
