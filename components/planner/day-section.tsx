'use client'

import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { DayPlan } from '../daily-planner'
import { Place } from '@/managers/types'
import { PlaceCompactCard } from './place-compact-card'
import { PlaceSearch } from './place-search'
import { Loader2, GripVertical, Clock, MoveHorizontal, ArrowRight } from 'lucide-react'
import { getStoredSession } from '../../managers/session-manager'
import { cn } from '@/utils/cn'
import { Fragment } from 'react'
import { TravelInfo } from './travel-info'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'

interface DaySectionProps {
  day: DayPlan
  index: number
  onDeletePlace: (dayId: string, placeId: string) => void
  onAddPlace: (dayId: string, place: Place) => void
  onPlacesChange: (dayId: string, places: Place[]) => void
  className?: string
  isDragging?: boolean
}

interface MapOperationDetail {
    type: 'add-place' | 'remove-place' | 'places-changed';
    place?: Place;
    placeId?: string;
    places?: Place[];
    count?: number;
}

const dispatchMapOperation = (detail: MapOperationDetail) => {
    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', { detail }));
};

export function DaySection({ day, index, onDeletePlace, onAddPlace, onPlacesChange, className = '', isDragging = false }: DaySectionProps) {
  const [isSearching, setIsSearching] = useState(false)
  const tPlan = useTranslations('itineraryplanner')
  const { locale } = useRouter()
  
  const handlePlaceDelete = (dayId: string, placeId: string) => {
    // Remove from map first
    dispatchMapOperation({
        type: 'remove-place',
        placeId
    });
    // Then remove from day section
    onDeletePlace(dayId, placeId);
  };

  const handlePlaceAdd = (place: Place) => {
    // Add to map first
    if (place.location) {
        dispatchMapOperation({
            type: 'add-place',
            place
        });
    }
    // Then add to day section
    onAddPlace(day.id, place);
  };

  // Format date to display like "Day 1 (Jan 21)" or "Day 1 (Jan 21, 2025)" if different year
  const date = new Date(day.date)
  const today = new Date()
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== today.getFullYear() && { year: 'numeric' })
  })

  return (
    <div className={`rounded-lg border dark:border-gray-700 bg-card dark:bg-gray-900 p-4 shadow-sm ${className}`}>
      <h2 className="mb-3 ml-1 text-lg font-semibold dark:text-gray-200">{tPlan('daySection.day', { index: index + 1 })} ({formattedDate})</h2>
      
      <div className="flex">
        {/* Places column with drag and drop */}
        <div className="flex-1">
          <Droppable droppableId={day.id}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1 md:space-y-4" // Increased gap for mobile to fit travel info
              >
                {day.places.map((place, placeIndex) => (
                  <Fragment key={place.id}>
                    <Draggable draggableId={place.id} index={placeIndex}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden relative',
                            snapshot.isDragging && 'ring-2 ring-primary dark:ring-sky-400 ring-offset-2 dark:ring-offset-gray-900 z-30'
                          )}
                        >
                          <div className="group relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <GripVertical className="h-7 w-5 text-gray-400 dark:text-gray-500 opacity-60 transition-opacity group-hover:opacity-100" />
                            </div>
                            <PlaceCompactCard place={place} className="pl-10" onDelete={() => handlePlaceDelete(day.id, place.id)} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                    
                    {/* Travel info below each place except last */}
                    {placeIndex < day.places.length - 1 && (
                      <div className="md:hidden -mt-4 mb-4">
                        <TravelInfo 
                          key={`${place.id}-${day.places[placeIndex + 1]?.id}`}
                          place={place}
                          nextPlace={day.places[placeIndex + 1]}
                          className="pointer-events-none px-4"
                        />
                      </div>
                    )}
                  </Fragment>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Travel info column with connecting lines - Only visible on desktop */}
        <div className="hidden md:flex w-[84px] relative flex-col gap-y-5 my-auto">
          {day.places.slice(0, -1).map((place, idx) => (
            <div key={`travel-${place.id}-${day.places[idx + 1]?.id}`} className="relative ml-[15px] align-middle flex" style={{ height: '88px' }}>
              {/* Travel info centered between places */}
              <div className="my-auto">
                <TravelInfo 
                  key={`${place.id}-${day.places[idx + 1]?.id}`}
                  place={place}
                  nextPlace={day.places[idx + 1]}
                  className="pointer-events-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <PlaceSearch
          onPlaceSelected={(place) => handlePlaceAdd(place)}
          disabled={isSearching}
          className="w-full"
        />
      </div>
    </div>
  )
}
