import { NextApiRequest, NextApiResponse } from 'next'

interface LatLng {
  latitude: number
  longitude: number
}

interface Waypoint {
  location: {
    latLng: LatLng
  }
}

interface RouteMatrixRequest {
  origins: Waypoint[]
  destinations: Waypoint[]
  travelMode?: string
  routingPreference?: string
  departureTime?: string
  languageCode?: string
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { origins, destinations, travelMode = 'DRIVE', routingPreference = 'TRAFFIC_AWARE', languageCode = 'en' } = req.body as RouteMatrixRequest
    
    // Validate request
    if (!origins?.length || !destinations?.length) {
      return res.status(400).json({ error: 'Origins and destinations are required' })
    }
    
    // Check size limits
    const totalWaypoints = origins.length + destinations.length
    if (totalWaypoints > 50) {
      return res.status(400).json({ error: 'Total number of waypoints (origins + destinations) exceeds limit of 50' })
    }
    
    const matrixSize = origins.length * destinations.length
    if (matrixSize > 625) {
      return res.status(400).json({ error: 'Matrix size (origins × destinations) exceeds limit of 625' })
    }
    
    if ((routingPreference === 'TRAFFIC_AWARE_OPTIMAL' || travelMode === 'TRANSIT') && matrixSize > 100) {
      return res.status(400).json({ 
        error: 'Matrix size exceeds limit of 100 for TRAFFIC_AWARE_OPTIMAL or TRANSIT mode'
      })
    }

    console.log('[route-matrix] Request:', { 
      originsCount: origins.length, 
      destinationsCount: destinations.length,
      travelMode,
      routingPreference
    })

    // Current time as departure time if not specified
    const departureTime = req.body.departureTime || new Date().toISOString()

    // Compute route matrix
    const response = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,status,condition,distanceMeters,duration'
      },
      body: JSON.stringify({
        origins,
        destinations,
        travelMode,
        routingPreference,
        departureTime,
        languageCode
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[route-matrix] Google API Error:', error)
      throw new Error(`Failed to compute route matrix: ${error}`)
    }

    // Parse response
    const data = await response.json()
    
    // Format and return matrix data
    return res.json({
      matrix: data,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[route-matrix] Error:', error)
    return res.status(500).json({ error: 'Failed to compute route matrix' })
  }
}
