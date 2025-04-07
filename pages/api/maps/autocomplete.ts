import { NextApiRequest, NextApiResponse } from 'next';

interface Prediction {
    description: string;
    place_id: string;
}

interface GooglePlacesResponse {
    predictions: Array<Prediction>;
    status: string;
}

interface AutocompleteResponse {
    predictions?: Array<Prediction>;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AutocompleteResponse>) {
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
        console.error('[Autocomplete API] Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { input } = req.body;

        if (!input) {
            console.error('[Autocomplete API] Missing input in request body');
            return res.status(400).json({ error: 'Input is required' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GOOGLE_MAPS_BACKEND_API_KEY;
        if (!apiKey) {
            console.error('[Autocomplete API] Google Maps API key not found in environment variables');
            return res.status(500).json({ error: 'Google Maps API key not configured' });
        }

        // Make request to Google Places Autocomplete API
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('[Autocomplete API] Google API Error:', response.status);
            throw new Error(`Google API responded with status: ${response.status}`);
        }

        const data = await response.json() as GooglePlacesResponse;
        
        // Check if we got valid results
        if (!data.predictions) {
            console.error('[Autocomplete API] No predictions found for input:', input);
            return res.status(404).json({ error: 'No predictions found' });
        }

        // Return only the necessary data
        return res.status(200).json({
            predictions: data.predictions.map((p: Prediction) => ({
                description: p.description,
                place_id: p.place_id
            }))
        });

    } catch (error) {
        console.error('[Autocomplete API] Error:', error);
        return res.status(500).json({ error: 'Failed to get predictions' });
    }
}
