'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { DaySection } from './day-section'
import { Place } from '@/managers/types'
import { savedPlacesManager } from '../../managers/saved-places-manager'
import { getStoredSession } from '@/managers/session-manager'
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { TravelDetails } from '../../managers/types'
import react from 'react'
import { travelInfoManager } from '@/utils/travel-info-utils'
import { ChatHeader } from '../chat/chat-header';
import { useTranslations } from 'next-intl'

export interface DayPlan {
    id: string
    date: string
    places: Place[]
}

interface ItineraryPlannerProps {
    onPlaceRemoved: (placeId: string) => void
}

interface MapOperationDetail {
    type: 'add-place' | 'remove-place' | 'update-place';
    place?: Place;
    placeId?: string;
    places?: Place[];
    count?: number;
}

// Helper function to dispatch map operations
const dispatchMapOperation = (detail: MapOperationDetail) => {
    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', { detail }));
};

export default function ItineraryPlanner({ onPlaceRemoved }: ItineraryPlannerProps) {
    const [days, setDays] = useState<DayPlan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [currentDetails, setCurrentDetails] = useState<TravelDetails>({
        destination: '',
        startDate: '',
        endDate: '',
        preferences: [],
        budget: '',
        language: '',
        transport: [],
        location: {
            latitude: 0,
            longitude: 0
        }
    })
    const [isDragging, setIsDragging] = useState(false)
    
    // Initialize days with saved places
    useEffect(() => {
        const session = getStoredSession()
        if (!session) {
            setIsLoading(false)
            return
        }
        
        // Set current details from session
        setCurrentDetails({
            destination: session.destination,
            startDate: session.startDate,
            endDate: session.endDate,
            preferences: session.preferences,
            budget: session.budget || '',
            language: session.language || '',
            transport: session.transport || [],
            // Use session location for city coordinates
            location: session.location || { latitude: 0, longitude: 0 }
        })
        
        // Calculate date range
        const startDate = new Date(session.startDate)
        const endDate = new Date(session.endDate)
        const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        
        // Distribute places evenly across days
        const minPlacesPerDay = Math.floor(savedPlacesManager.getPlaces().length / numberOfDays)
        const extraPlaces = savedPlacesManager.getPlaces().length % numberOfDays
        
        let placeIndex = 0
        const initialDays = Array.from({ length: numberOfDays }, (_, dayIndex) => {
            // Calculate number of places for this day
            const placesForThisDay = dayIndex < extraPlaces ? minPlacesPerDay + 1 : minPlacesPerDay
            
            // Get places for this day and set their indices
            const dayPlaces = savedPlacesManager.getPlaces().slice(placeIndex, placeIndex + placesForThisDay)
            .map((place, orderIndex) => {
                place.dayIndex = dayIndex
                place.orderIndex = orderIndex
                savedPlacesManager.updatePlace(place)
                return place
            })
            placeIndex += placesForThisDay
            
            // Calculate date for this day
            const dayDate = new Date(startDate)
            dayDate.setDate(startDate.getDate() + dayIndex)
            
            return {
                id: `day-${dayIndex + 1}`,
                date: dayDate.toISOString().split('T')[0],
                places: dayPlaces
            }
        })
        
        setDays(initialDays)
        setIsLoading(false)
    }, [])
    
    const onDragStart = () => {
        setIsDragging(true)
    }
    
    const onDragEnd = async (result: DropResult) => {
        setIsDragging(false);
        if (!result.destination) return;
        const { source, destination } = result;
    
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }
    
        const sourceDayIndex = days.findIndex(day => day.id === source.droppableId);
        const destDayIndex = days.findIndex(day => day.id === destination.droppableId);
        if (sourceDayIndex === -1 || destDayIndex === -1) return;
    
        const newDays = [...days];
        const sourceDay = { ...newDays[sourceDayIndex] };
        const destDay = sourceDayIndex === destDayIndex ? sourceDay : { ...newDays[destDayIndex] };

        const [movedPlace] = sourceDay.places.splice(source.index, 1);
        movedPlace.dayIndex = destDayIndex;
        movedPlace.orderIndex = destination.index;
        destDay.places.splice(destination.index, 0, movedPlace);

        sourceDay.places = sourceDay.places.map((place, idx) => ({
            ...place,
            dayIndex: sourceDayIndex,
            orderIndex: idx
        }));

        if (sourceDayIndex !== destDayIndex) {
            destDay.places = destDay.places.map((place, idx) => ({
                ...place,
                dayIndex: destDayIndex,
                orderIndex: idx
            }));
        }

        newDays[sourceDayIndex] = sourceDay;
        if (sourceDayIndex !== destDayIndex) {
            newDays[destDayIndex] = destDay;
        }

        setDays(newDays);

        const allAffectedPlaces = [
            ...sourceDay.places,
            ...(sourceDayIndex !== destDayIndex ? destDay.places : [])
        ];

        // Ensure persistence completes before continuing
        await savedPlacesManager.updatePlaces(allAffectedPlaces);

        window.dispatchEvent(new CustomEvent('clear-active-routes'));
        travelInfoManager.clearRoutesForPlaces(allAffectedPlaces);

        // Dispatch 'update-place' for each affected place
        allAffectedPlaces.forEach(place => {
            dispatchMapOperation({
                type: 'update-place',
                place
            });
        });
    };
    
    const handleDeletePlace = (dayId: string, placeId: string) => {
        const day = days.find(d => d.id === dayId);
        if (day) {
            // Get adjacent places to clear their routes
            const placeIndex = day.places.findIndex(p => p.id === placeId);
            const placesToClear = [];
            
            // Get the place being deleted
            const place = day.places[placeIndex];
            if (place) placesToClear.push(place);
            
            // Get previous place if exists
            if (placeIndex > 0) {
                placesToClear.push(day.places[placeIndex - 1]);
            }
            
            // Get next place if exists
            if (placeIndex < day.places.length - 1) {
                placesToClear.push(day.places[placeIndex + 1]);
            }
            
            // Clear routes for all affected places at once
            travelInfoManager.clearRoutesForPlaces(placesToClear);
        }
        
        setDays(days.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    places: day.places.filter(place => place.id !== placeId)
                }
            }
            return day
        }))
        
        // Also remove from savedPlacesManager
        savedPlacesManager.removePlace(placeId)
        onPlaceRemoved(placeId)
    }
    
    const handleAddPlace = (dayId: string, place: Place) => {
        setDays(days.map(day => {
            if (day.id === dayId) {
                // Add to end of day's places
                const orderIndex = day.places.length
                place.dayIndex = days.indexOf(day)
                place.orderIndex = orderIndex
                
                // Clear travel info cache for adjacent places
                const placesToClear = [place];
                if (day.places.length > 0) {
                    // Add last place in day (will be connected to new place)
                    placesToClear.push(day.places[day.places.length - 1]);
                }
                
                // Clear routes for all affected places at once
                travelInfoManager.clearRoutesForPlaces(placesToClear);
                
                return {
                    ...day,
                    places: [...day.places, place]
                }
            }
            return day
        }))
        
        // Add to savedPlacesManager
        savedPlacesManager.addPlace(place)
    }
    
    const handlePlacesChange = (dayId: string, newPlaces: Place[]) => {
        // Update days state
        setDays(days.map(day => {
            if (day.id === dayId) {
                // Update all places' order indices sequentially
                const updatedPlaces = newPlaces.map((place, idx) => ({
                    ...place,
                    orderIndex: idx
                }));
                // Update in savedPlacesManager
                updatedPlaces.forEach(place => {
                    savedPlacesManager.updatePlace(place);
                });
                return { ...day, places: updatedPlaces };
            }
            return day;
        }));
    };
    
    return (
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-gray-900/95 transition-all duration-400 ease-in-out">
        
        <div className="sticky top-0 z-10 w-full">
        <ChatHeader
        currentDetails={currentDetails}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        />
        </div>
        
        {/* Days list */}
        <div className="flex-1 overflow-y-scroll p-4 space-y-4">
        {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4 rounded-lg border bg-card p-4">
                <div className="h-6 w-1/4 rounded bg-muted" />
                <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-md bg-muted" />
                    <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                    </div>
                ))}
                </div>
                </div>
            ))
        ) : (
            days.map((day, index) => (
                <DaySection
                key={day.id}
                day={day}
                index={index}
                onDeletePlace={handleDeletePlace}
                onAddPlace={handleAddPlace}
                onPlacesChange={handlePlacesChange}
                isDragging={isDragging}
                />
            ))
        )}
        </div>
        </div>
        </DragDropContext>
    )
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                itineraryplanner: (await import(`../../public/locales/${locale}/itineraryplanner.json`)).default,
                parameters: (await import(`../../public/locales/${locale}/parameters.json`)).default
            },
            locale
        }
    }
}
