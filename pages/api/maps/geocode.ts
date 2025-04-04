import { NextApiRequest, NextApiResponse } from 'next';

// Types for the geocoding response
interface GeocodeResponse {
    location?: {
        latitude: number;
        longitude: number;
    };
    key?: string;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GeocodeResponse>) {
    // Set CORS and caching headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.error('[Geocode API] Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { address } = req.body;

        if (!address) {
            console.error('[Geocode API] Missing address in request body');
            return res.status(400).json({ error: 'Address is required' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('[Geocode API] Google Maps API key not found in environment variables');
            return res.status(500).json({ error: 'Google Maps API key not configured' });
        }

        // Make request to Google Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('[Geocode API] Google API Error:', response.status);
            throw new Error(`Google API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we got valid results
        if (!data.results || data.results.length === 0) {
            console.error('[Geocode API] No results found for address:', address);
            return res.status(404).json({ error: 'No results found for the given address' });
        }

        // Extract location from the first result
        const location = data.results[0].geometry.location;
        
        // Return the coordinates and API key
        return res.status(200).json({
            location: {
                latitude: location.lat,
                longitude: location.lng
            },
            key: apiKey
        });

    } catch (error) {
        console.error('[Geocode API] Error:', error);
        return res.status(500).json({ error: 'Failed to geocode address' });
    }
}
