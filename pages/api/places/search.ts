import { NextApiRequest, NextApiResponse } from 'next';
import { SearchConfig } from '@/utils/places-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const config: SearchConfig = req.body;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error('[Places API] Google Maps API key not found');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName.text,places.displayName.languageCode,places.formattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName.text,places.primaryTypeDisplayName.languageCode,places.photos.name,places.photos.widthPx,places.photos.heightPx,places.regularOpeningHours,places.rating,places.userRatingCount,places.priceLevel'
        };

        const endpoint = config.endpoint === 'text' 
            ? 'https://places.googleapis.com/v1/places:searchText'
            : 'https://places.googleapis.com/v1/places:searchNearby';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(config.endpoint === 'text' 
                ? { textQuery: config.query, languageCode: config.languageCode }
                : { locationRestriction: config.locationRestriction })
        });

        if (!response.ok) {
            console.error('[Places API] Search failed:', response.status);
            return res.status(response.status).json({ error: 'Failed to search places' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('[Places API] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
