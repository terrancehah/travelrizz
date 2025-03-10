import { NextApiRequest, NextApiResponse } from 'next'

export interface LatLng {
  latitude: number
  longitude: number
}

export interface Waypoint {
  waypoint: {
    location: {
      latLng: LatLng
    }
  }
}

export interface RouteMatrixRequest {
  origins: Waypoint[]
  destinations: Waypoint[]
  languageCode?: string
}

export interface RouteMatrix {
  matrix: RouteMatrixElement[]
  timestamp: number
}

export interface RouteMatrixElement {
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
    const { origins, destinations, languageCode = 'en' } = req.body as RouteMatrixRequest
    
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
    
    console.log('[route-matrix] Request:', { 
      originsCount: origins.length, 
      destinationsCount: destinations.length
    })

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
    const routeMatrix = {
      matrix: data as RouteMatrixElement[],
      timestamp: Date.now()
    }
    return res.json(routeMatrix)
  } catch (error) {
    console.error('[route-matrix] Error:', error)
    return res.status(500).json({ error: 'Failed to compute route matrix' })
  }
}
