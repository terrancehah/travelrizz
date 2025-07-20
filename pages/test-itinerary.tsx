
"use client"

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getStoredSession, initializeSession, SESSION_CONFIG } from '../managers/session-manager';
import { savedPlacesManager } from '../managers/saved-places-manager';
import { useTheme } from "next-themes";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

const ItineraryExport = dynamic(() => import('../components/planner/itinerary-export'), { 
    ssr: false,
});

export default function TestItineraryPage({ messages, locale }: { messages: any, locale: string }) {
    const [itineraryData, setItineraryData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const setupTestEnvironment = async () => {
            // 1. Create and store a mock session
            const mockSession = {
                destination: 'Tokyo, Japan',
                startDate: '2025-08-01',
                endDate: '2025-08-05',
                preferences: ['culture', 'food'],
                budget: 'moderate',
                language: 'en',
                transport: ['public_transport'],
                savedPlaces: [
                    { id: '1', displayName: { text: 'Tokyo Tower', languageCode: 'en' }, formattedAddress: '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan', dayIndex: 0, orderIndex: 0 },
                    { id: '2', displayName: { text: 'Senso-ji Temple', languageCode: 'en' }, formattedAddress: '2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan', dayIndex: 0, orderIndex: 1 },
                    { id: '3', displayName: { text: 'Meiji Jingu', languageCode: 'en' }, formattedAddress: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo 151-8557, Japan', dayIndex: 1, orderIndex: 0 },
                ],
                currentStage: 5,
                isPaid: true,
            };

            const session = initializeSession();
            Object.assign(session, mockSession);
            
            // Correctly store in sessionStorage
            sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session));

            savedPlacesManager.reset();
            mockSession.savedPlaces.forEach(place => savedPlacesManager.addPlace(place));

            // 2. Fetch the generated itinerary from the backend
            try {
                const response = await fetch('/api/itinerary', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        destination: mockSession.destination,
                        startDate: mockSession.startDate,
                        endDate: mockSession.endDate,
                        preferences: mockSession.preferences,
                        savedPlaces: savedPlacesManager.getPlaces(),
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setItineraryData(data.data);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to generate itinerary');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        setupTestEnvironment();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading test environment...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
    }

    if (!itineraryData) {
        return <div className="flex items-center justify-center h-screen">No itinerary data to display.</div>;
    }

    return (
        <div className="w-full h-full overflow-y-scroll">
            <ItineraryExport itineraryData={itineraryData} />
        </div>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                "itinerary-export": (await import(`../public/locales/${locale}/itinerary-export.json`)).default
            },
            locale
        }
    }
}
