import { Place } from './places-utils'
import { travelInfoManager } from './travel-info-utils'

interface RouteMatrixElement {
  originIndex: number
  destinationIndex: number
  status: {
    code: number
    message?: string
  }
  condition?: string
  distanceMeters?: number
  duration?: string
  staticDuration?: string
}

interface RouteMatrix {
  matrix: RouteMatrixElement[]
  timestamp: number
}

interface OptimizationResult {
  places: Place[]
  changes: OptimizationChange[]
  totalTravelTime: number
  totalDistance: number
}

interface OptimizationChange {
  placeId: string
  placeName: string
  fromDay: number
  toDay: number
  fromIndex: number
  toIndex: number
  reason: string
}

/**
 * Converts a duration string from the API (e.g. "1234s") to seconds
 */
function durationToSeconds(duration?: string): number {
  if (!duration) return 0
  return parseInt(duration.replace('s', ''))
}

/**
 * Formats duration in seconds to a human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

/**
 * Checks if a place is open at a specific time
 */
function isPlaceOpen(place: Place, date: Date): boolean {
  // Assume open if no hours data or no periods array
  if (!place.regularOpeningHours || !place.regularOpeningHours.periods) return true
  
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay()
  
  // Get current hour and minute
  const currentHour = date.getHours()
  const currentMinute = date.getMinutes()
  
  // Check if place is open on this day
  const openPeriods = place.regularOpeningHours.periods.filter(period => 
    period.open.day === dayOfWeek
  )
  
  // If no periods for this day, place is closed
  if (openPeriods.length === 0) return false
  
  // Check if current time falls within any open period
  return openPeriods.some(period => {
    const openHour = period.open.hour
    const openMinute = period.open.minute
    const closeHour = period.close.hour
    const closeMinute = period.close.minute
    
    // Convert to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const openTimeInMinutes = openHour * 60 + openMinute
    const closeTimeInMinutes = closeHour * 60 + closeMinute
    
    // Handle overnight periods (close time < open time)
    if (closeTimeInMinutes < openTimeInMinutes) {
      return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes
    }
    
    // Normal case
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes
  })
}

/**
 * Estimates arrival time at a place based on departure time and travel duration
 */
function estimateArrivalTime(departureTime: Date, durationSeconds: number): Date {
  const arrivalTime = new Date(departureTime)
  arrivalTime.setSeconds(arrivalTime.getSeconds() + durationSeconds)
  return arrivalTime
}

/**
 * Fetches route matrix data for a set of places
 */
async function fetchRouteMatrix(places: Place[]): Promise<RouteMatrix> {
  // Create waypoints from places with correct format for Google Routes API
  const waypoints = places.map(place => ({
    location: {
      latLng: {
        latitude: place.location?.latitude || 0,
        longitude: place.location?.longitude || 0
      }
    }
  }))
  
  // Determine base URL for API call
  const baseUrl = typeof window !== 'undefined' 
    ? '' // Empty string for client-side (relative URL)
    : 'http://localhost:3000'; // Use appropriate URL for server-side
  
  // Fetch matrix data
  const response = await fetch(`${baseUrl}/api/maps/route-matrix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origins: waypoints,
      destinations: waypoints,
      languageCode: 'en'
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch route matrix')
  }
  
  return await response.json()
}

/**
 * Gets travel time between two places from the route matrix
 */
function getTravelTime(fromIndex: number, toIndex: number, matrix: RouteMatrixElement[]): number {
  const element = matrix.find(e => 
    e.originIndex === fromIndex && e.destinationIndex === toIndex
  )
  
  return element && element.duration 
    ? durationToSeconds(element.duration) 
    : 0
}

/**
 * Optimizes places arrangement based on travel time and opening hours
 */
export async function optimizePlaces(
  places: Place[], 
  startDate: string, 
  endDate: string,
  optimizationReason?: string
): Promise<OptimizationResult> {
  // Ensure we have places to optimize
  if (!places || places.length === 0) {
    throw new Error('No places to optimize')
  }
  
  // Ensure all places have the required properties
  const validPlaces = places.map(place => ({
    ...place,
    name: place.name || (typeof place.displayName === 'string' ? place.displayName : place.displayName?.text),
    primaryType: place.primaryType || 'unknown',
    photos: place.photos || []
  }));
  
  // If no places or only one place, no optimization needed
  if (!validPlaces.length || validPlaces.length === 1) {
    return { 
      places: validPlaces, 
      changes: [], 
      totalTravelTime: 0, 
      totalDistance: 0 
    }
  }
  
  // Fetch route matrix for all places
  const routeMatrix = await fetchRouteMatrix(validPlaces)
  
  // Group places by day
  const placesByDay: Place[][] = []
  validPlaces.forEach(place => {
    const dayIndex = place.dayIndex || 0
    if (!placesByDay[dayIndex]) {
      placesByDay[dayIndex] = []
    }
    placesByDay[dayIndex].push(place)
  })
  
  // Sort places within each day by orderIndex
  placesByDay.forEach(dayPlaces => {
    dayPlaces.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  })
  
  // Calculate start date for each day
  const startDateObj = new Date(startDate)
  const dayDates = Array.from({ length: placesByDay.length }, (_, i) => {
    const date = new Date(startDateObj)
    date.setDate(startDateObj.getDate() + i)
    return date
  })
  
  // Track changes for explanation
  const changes: OptimizationChange[] = []
  
  // Check for closed places and optimize
  for (let dayIndex = 0; dayIndex < placesByDay.length; dayIndex++) {
    const dayPlaces = placesByDay[dayIndex]
    const dayDate = dayDates[dayIndex]
    
    // Skip empty days
    if (!dayPlaces.length) continue
    
    // Check each place for opening hours
    for (let i = 0; i < dayPlaces.length; i++) {
      const place = dayPlaces[i]
      
      // Estimate arrival time (assume 10:00 AM start for first place)
      let arrivalTime = new Date(dayDate);
      if (i === 0) {
        arrivalTime.setHours(10, 0, 0, 0)
      } else {
        // Calculate arrival time based on previous place and travel time
        const prevPlace = dayPlaces[i - 1]
        const prevIndex = validPlaces.findIndex(p => p.id === prevPlace.id)
        const currentIndex = validPlaces.findIndex(p => p.id === place.id)
        
        // Get travel time from previous place
        const travelTime = getTravelTime(
          prevIndex, 
          currentIndex, 
          routeMatrix.matrix
        )
        
        // Assume 1 hour spent at previous place
        const departureTime = new Date(dayDate)
        if (i === 1) {
          departureTime.setHours(11, 0, 0, 0) // First place departure at 11:00 AM
        } else {
          // Calculate based on arrival at previous place
          departureTime.setHours(arrivalTime.getHours(), arrivalTime.getMinutes(), 0, 0)
          departureTime.setMinutes(departureTime.getMinutes() + 60) // 1 hour at location
        }
        
        arrivalTime = estimateArrivalTime(departureTime, travelTime)
      }
      
      // Check if place is open at estimated arrival time
      if (!isPlaceOpen(place, arrivalTime)) {
        // Try to find a better day for this place
        let bestDay = -1
        let bestReason = ''
        
        for (let newDayIndex = 0; newDayIndex < dayDates.length; newDayIndex++) {
          // Skip current day
          if (newDayIndex === dayIndex) continue
          
          const newDayDate = dayDates[newDayIndex]
          
          // Check if place would be open at same time on different day
          const newArrivalTime = new Date(newDayDate)
          newArrivalTime.setHours(
            arrivalTime.getHours(), 
            arrivalTime.getMinutes(), 
            arrivalTime.getSeconds()
          )
          
          if (isPlaceOpen(place, newArrivalTime)) {
            bestDay = newDayIndex
            const displayNameText = typeof place.displayName === 'string' 
              ? place.displayName 
              : place.displayName.text
            bestReason = `${displayNameText} would be closed on day ${dayIndex + 1} at ${arrivalTime.getHours()}:${arrivalTime.getMinutes().toString().padStart(2, '0')}, but open on day ${newDayIndex + 1}`
            break
          }
        }
        
        // If found a better day, move the place
        if (bestDay !== -1) {
          // Record the change
          changes.push({
            placeId: place.id,
            placeName: typeof place.displayName === 'string' 
              ? place.displayName 
              : place.displayName.text,
            fromDay: dayIndex,
            toDay: bestDay,
            fromIndex: i,
            toIndex: placesByDay[bestDay].length, // Add to end of new day
            reason: bestReason
          })
          
          // Update place indices
          place.dayIndex = bestDay
          place.orderIndex = placesByDay[bestDay].length
          
          // Move place to new day
          placesByDay[bestDay].push(place)
          
          // Remove from current day (adjust loop counter)
          dayPlaces.splice(i, 1)
          i--
        }
      }
    }
  }
  
  // Optimize travel time within each day
  for (let dayIndex = 0; dayIndex < placesByDay.length; dayIndex++) {
    const dayPlaces = placesByDay[dayIndex]
    
    // Skip days with 0-1 places (no optimization needed)
    if (dayPlaces.length <= 1) continue
    
    // Simple greedy algorithm for TSP (Traveling Salesman Problem)
    // Start with first place and always go to nearest unvisited place
    const optimizedOrder: Place[] = [dayPlaces[0]]
    const unvisited = dayPlaces.slice(1)
    
    while (unvisited.length > 0) {
      const lastPlace = optimizedOrder[optimizedOrder.length - 1]
      const lastIndex = validPlaces.findIndex(p => p.id === lastPlace.id)
      
      // Find nearest unvisited place
      let bestIndex = 0
      let bestTime = Infinity
      
      for (let i = 0; i < unvisited.length; i++) {
        const nextPlace = unvisited[i]
        const nextIndex = validPlaces.findIndex(p => p.id === nextPlace.id)
        
        const travelTime = getTravelTime(lastIndex, nextIndex, routeMatrix.matrix)
        
        if (travelTime < bestTime) {
          bestTime = travelTime
          bestIndex = i
        }
      }
      
      // Add nearest place to optimized order
      const nextPlace = unvisited[bestIndex]
      
      // Check if order changed
      const originalIndex = dayPlaces.findIndex(p => p.id === nextPlace.id)
      const newIndex = optimizedOrder.length
      
      if (originalIndex !== newIndex) {
        changes.push({
          placeId: nextPlace.id,
          placeName: typeof nextPlace.displayName === 'string' 
            ? nextPlace.displayName 
            : nextPlace.displayName.text,
          fromDay: dayIndex,
          toDay: dayIndex,
          fromIndex: originalIndex,
          toIndex: newIndex,
          reason: `Reordered to reduce travel time`
        })
      }
      
      optimizedOrder.push(nextPlace)
      unvisited.splice(bestIndex, 1)
    }
    
    // Update order indices
    optimizedOrder.forEach((place, index) => {
      place.orderIndex = index
    })
    
    // Replace day places with optimized order
    placesByDay[dayIndex] = optimizedOrder
  }
  
  // Flatten places back to single array
  const optimizedPlaces: Place[] = []
  placesByDay.forEach((dayPlaces, dayIndex) => {
    dayPlaces.forEach((place, index) => {
      place.dayIndex = dayIndex
      place.orderIndex = index
      optimizedPlaces.push(place)
    })
  })
  
  // Calculate total travel time and distance
  let totalTravelTime = 0
  let totalDistance = 0
  
  for (let dayIndex = 0; dayIndex < placesByDay.length; dayIndex++) {
    const dayPlaces = placesByDay[dayIndex]
    
    for (let i = 1; i < dayPlaces.length; i++) {
      const prevPlace = dayPlaces[i - 1]
      const currentPlace = dayPlaces[i]
      
      const prevIndex = validPlaces.findIndex(p => p.id === prevPlace.id)
      const currentIndex = validPlaces.findIndex(p => p.id === currentPlace.id)
      
      const element = routeMatrix.matrix.find(e => 
        e.originIndex === prevIndex && e.destinationIndex === currentIndex
      )
      
      if (element) {
        totalTravelTime += durationToSeconds(element.duration)
        totalDistance += element.distanceMeters || 0
      }
    }
  }
  
  return {
    places: optimizedPlaces,
    changes,
    totalTravelTime,
    totalDistance
  }
}

/**
 * Generates a human-readable explanation of optimization changes
 */
export function generateOptimizationExplanation(result: OptimizationResult): string {
  if (result.changes.length === 0) {
    return 'No changes were needed. The current arrangement is already optimal.'
  }
  
  let explanation = `I've optimized your itinerary to save you ${formatDuration(result.totalTravelTime)} of travel time.\n\n`
  
  // Group changes by type
  const dayChanges = result.changes.filter(c => c.fromDay !== c.toDay)
  const orderChanges = result.changes.filter(c => c.fromDay === c.toDay && c.fromIndex !== c.toIndex)
  
  if (dayChanges.length > 0) {
    explanation += 'Changes between days:\n'
    dayChanges.forEach(change => {
      explanation += `- Moved "${change.placeName}" from Day ${change.fromDay + 1} to Day ${change.toDay + 1}: ${change.reason}\n`
    })
    explanation += '\n'
  }
  
  if (orderChanges.length > 0) {
    explanation += 'Reordered places to optimize travel time:\n'
    orderChanges.forEach(change => {
      explanation += `- Reordered "${change.placeName}" on Day ${change.fromDay + 1}\n`
    })
  }
  
  return explanation
}

/**
 * Main optimization function that handles the entire process
 */
export async function optimizeItinerary(
  places: Place[], 
  startDate: string, 
  endDate: string,
  optimizationReason?: string
): Promise<{
  optimizedPlaces: Place[],
  explanation: string,
  totalTravelTime: number,
  totalDistance: number
}> {
  try {
    // Perform optimization
    const result = await optimizePlaces(places, startDate, endDate, optimizationReason)
    
    // Generate explanation
    const explanation = generateOptimizationExplanation(result)
    
    return {
      optimizedPlaces: result.places,
      explanation,
      totalTravelTime: result.totalTravelTime,
      totalDistance: result.totalDistance
    }
  } catch (error) {
    console.error('[optimizeItinerary] Error:', error)
    throw error
  }
}
