import { Place } from '../managers/types'
import { travelInfoManager } from './travel-info-utils'
import { RouteMatrix, RouteMatrixElement } from '../pages/api/maps/route-matrix'

interface OptimizationResult {
  places: Place[]
  totalTravelTime: number
  totalDistance: number
}

/**
 * Converts a duration string from the API (e.g. "1234s") to seconds
 */
function durationToSeconds(duration?: string): number {
  if (!duration) return 0
  return parseInt(duration.replace('s', ''))
}



/**
 * Checks if a place is open at a specific time
 */
/**
 * Determines if a place is open at a specific date and time
 * @param place - The place to check
 * @param date - The date and time to check against
 * @returns true if the place is open, false otherwise
 */
function isPlaceOpen(place: Place, date: Date): boolean {
  // If no opening hours data available, assume the place is open
  // This prevents false negatives when hours data is missing
  if (!place.regularOpeningHours || !place.regularOpeningHours.periods) return true
  
  // Get day of week (0 = Sunday, 6 = Saturday) and current time
  const dayOfWeek = date.getDay()
  const currentHour = date.getHours()
  const currentMinute = date.getMinutes()
  
  // Find all valid opening periods for the current day
  // We only consider periods that have both opening and closing times defined
  const openPeriods = place.regularOpeningHours.periods.filter(period => 
    period.open?.day === dayOfWeek && period.open && period.close
  )
  
  // If there are no valid opening periods for this day, the place is closed
  if (openPeriods.length === 0) return false
  
  // Check if the current time falls within any of the open periods
  return openPeriods.some(period => {
    // We can safely use non-null assertion (!) here since we filtered out
    // any periods with undefined open/close times in the filter above
    const openHour = period.open!.hour
    const openMinute = period.open!.minute
    const closeHour = period.close!.hour
    const closeMinute = period.close!.minute
    
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
  const waypoints = places.map(place => ({
    waypoint: {
      location: {
        latLng: {
          latitude: place.location?.latitude,
          longitude: place.location?.longitude
        }
      }
    }
  }))
  
  const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/maps/route-matrix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origins: waypoints, destinations: waypoints })
  })
  
  if (!response.ok) throw new Error('Failed to fetch route matrix')
  return response.json()
}
/**
 * Gets travel time between two places from the route matrix
 */
function getTravelTime(fromIndex: number, toIndex: number, matrix: RouteMatrixElement[]): number {
  const element = matrix.find((e: RouteMatrixElement) => 
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
  endDate: string
): Promise<OptimizationResult> {
  // Ensure we have places to optimize
  if (!places || places.length === 0) {
    throw new Error('No places to optimize')
  }
  
  // Ensure all places have the required properties
  const validPlaces = places.map(place => ({
    ...place,
    displayName: place.displayName,
    primaryType: place.primaryType,
    primaryTypeDisplayName: place.primaryTypeDisplayName,
    photos: place.photos
  }));
  
  // If no places or only one place, no optimization needed
  if (!validPlaces.length || validPlaces.length === 1) {
    return { 
      places: validPlaces, 
      totalTravelTime: 0, 
      totalDistance: 0 
    }
  }
  
  // Fetch route matrix for all places
  const routeMatrix = await fetchRouteMatrix(validPlaces)
  
  // Calculate number of days in the trip
  const tripStartDate = new Date(startDate)
  const tripEndDate = new Date(endDate)
  const diffTime = Math.abs(tripEndDate.getTime() - tripStartDate.getTime())
  const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  // Calculate places per day with minimum variance
  const basePlaces = Math.floor(validPlaces.length / numberOfDays)
  const remainder = validPlaces.length % numberOfDays
  const distribution = Array(numberOfDays).fill(basePlaces)

  // Distribute remainder to minimize variance (e.g., 10 places, 3 days -> [3,4,3])
  if (remainder > 0) {
    const midIndex = Math.floor(numberOfDays / 2)
    let leftIndex = midIndex - 1
    let rightIndex = midIndex

    for (let i = 0; i < remainder; i++) {
      if (i === 0) distribution[midIndex]++
      else if (leftIndex >= 0) distribution[leftIndex--]++
      else if (rightIndex < numberOfDays) distribution[rightIndex++]++
    }
  }

  // Initialize placesByDay array
  const placesByDay: Place[][] = Array(numberOfDays).fill(null).map(() => [])

  // Distribute places according to calculated distribution
  let placeIndex = 0
  distribution.forEach((count, dayIndex) => {
    for (let i = 0; i < count && placeIndex < validPlaces.length; i++) {
      placesByDay[dayIndex].push(validPlaces[placeIndex++])
    }
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
        
        for (let newDayIndex = 0; newDayIndex < dayDates.length; newDayIndex++) {
          if (newDayIndex === dayIndex) continue
          
          const newDayDate = dayDates[newDayIndex]
          const newArrivalTime = new Date(newDayDate)
          newArrivalTime.setHours(
            arrivalTime.getHours(), 
            arrivalTime.getMinutes(), 
            arrivalTime.getSeconds()
          )
          
          if (isPlaceOpen(place, newArrivalTime)) {
            bestDay = newDayIndex
            break
          }
        }
        
        // If found a better day, move the place
        if (bestDay !== -1) {

          
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
      // Get original place from validPlaces to ensure all fields are preserved
      const originalPlace = validPlaces.find(p => p.id === place.id)
      if (originalPlace) {
        const optimizedPlace = {
          ...originalPlace,
          dayIndex,
          orderIndex: index
        }
        optimizedPlaces.push(optimizedPlace)
      }
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
    totalTravelTime,
    totalDistance
  }
}

/**
 * Main optimization function that handles the entire process
 */
export async function optimizeItinerary(
  places: Place[], 
  startDate: string, 
  endDate: string
): Promise<Place[]> {
  const result = await optimizePlaces(places, startDate, endDate)
  return result.places
}
