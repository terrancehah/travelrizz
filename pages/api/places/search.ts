import { NextApiRequest, NextApiResponse } from 'next';
import { SearchConfig } from '@/utils/places-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORS headers and preflight handling remain unchanged
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

            const requestBody = config.endpoint === 'text' 
            ? {
                textQuery: config.query as string,
                locationBias: {
                    circle: {
                        center: config.location,
                        radius: config.radius || 20000.0
                    }
                },
                maxResultCount: config.maxResults || 5,
                languageCode: config.languageCode || 'en'  // Add language code
            }
            : {
                locationRestriction: {
                    circle: {
                        center: config.location,
                        radius: config.radius || 5000.0
                    }
                },
                includedTypes: Array.isArray(config.query) ? config.query : [config.query],
                maxResultCount: config.maxResults || 5,
                languageCode: config.languageCode || 'en'  // Modify to use config language code
            };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
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
