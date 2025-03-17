import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('[Places API] Received request for photo');
    
    // Set CORS and caching headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        console.error('[Places API] Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { photoName, maxWidth, maxHeight } = req.query;
        
        if (!photoName) {
            return res.status(400).json({ error: 'Photo name is required' });
        }
        
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('[Places API] Google Maps API key not found');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Construct URL with optional parameters
        let url = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}`;
        if (maxWidth) url += `&maxWidthPx=${maxWidth}`;
        if (maxHeight) url += `&maxHeightPx=${maxHeight}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('[Places API] Error fetching photo:', response.status);
            return res.status(response.status).json({ error: 'Failed to fetch photo' });
        }

        // Forward the image response
        const imageBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        return res.send(Buffer.from(imageBuffer));
    } catch (error) {
        console.error('[Places API] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
