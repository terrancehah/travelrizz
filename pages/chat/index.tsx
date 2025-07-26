// pages/index.tsx
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { TravelPreference, BudgetLevel, SupportedLanguage, TravelDetails, TravelSession } from '@/managers/types';
import { Place } from '@/managers/types';
import { getStoredSession, initializeSession, SESSION_CONFIG, checkSessionValidity, updateLastActive, getPaymentReference, setPaymentStatus, clearPaymentReference, getPaymentStatus, updateSessionLocation } from '../../managers/session-manager';
import { savedPlacesManager } from '../../managers/saved-places-manager';
import PaymentSuccessPopup from '../../components/modals/payment-success-popup';
import PremiumUpgradeModal from '../../components/modals/premium-upgrade-modal';
import { validateStageProgression } from '../../managers/stage-manager';
import { Map } from "lucide-react"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"
import Image from 'next/image';
import Link from "next/link"
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';


import { useGoogleMaps } from '../_app';

const TravelChatComponent = dynamic(() => import('../../components/chat/travel-chat'), {
    ssr: false,
})

const ItineraryPlanner = dynamic(() => import('@/components/planner/daily-planner'), {
    ssr: false,
})

const MapComponent = dynamic(() => import('@/components/features/map-component'), {
    ssr: false,
})

const StageProgress = dynamic(() => import('@/components/stage-progress'), { 
    ssr: false,
})

const ItineraryExport = dynamic(() => import('@/components/planner/itinerary-export'), { 
    ssr: false,
})

type SessionData = {
    messages: any[];
    travelDetails: TravelDetails;
    savedPlaces: Place[];
    currentStage: number;
    isPaid: boolean;
};

export default function ChatPage({ messages, locale }: { messages: any, locale: string }) {
    const { mapsApiStatus } = useGoogleMaps();
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(true);
    const { theme, setTheme } = useTheme()
    const [isMobile, setIsMobile] = useState(false);
    const fonts = useLocalizedFont();
    const [isDetailsReady, setIsDetailsReady] = useState(false);
    const [travelDetails, setTravelDetails] = useState<TravelDetails>({
        destination: '',
        startDate: '',
        endDate: '',
        preferences: [],
        budget: '',
        language: '',
        transport: [],
        location: {
            latitude: 0,
            longitude: 0
        }
    });
    const [itineraryData, setItineraryData] = useState<any>(null);
    const router = useRouter();
    const handleGenerateItinerary = async () => {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/itinerary', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                destination: travelDetails.destination,
                startDate: travelDetails.startDate,
                endDate: travelDetails.endDate,
                preferences: travelDetails.preferences,
                savedPlaces: savedPlacesManager.getPlaces(),
            })
        });
        if (response.ok) {
            const data = await response.json();
            setItineraryData(data.data);
            setCurrentStage(5);
        } else {
            setError('Failed to generate itinerary');
        }
        setIsLoading(false);
    };

    const [currentStage, setCurrentStage] = useState<number>(1);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [savedPlacesUpdate, setSavedPlacesUpdate] = useState(0);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const tComp = useTranslations('components');

    useEffect(() => {
        if (router.query.test === 'true') {
            const mockSession = {
                destination: 'Tokyo, Japan',
                startDate: '2025-08-01',
                endDate: '2025-08-05',
                preferences: ['culture', 'food'],
                budget: 'moderate',
                language: 'en',
                transport: ['public_transport'],
                savedPlaces: [
                    {
                        id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                        displayName: { text: 'Tokyo Tower', languageCode: 'en' },
                        formattedAddress: '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan',
                        location: { latitude: 35.6585805, longitude: 139.7454329 },
                        photos: [
                            {
                                name: 'places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/AUacShi_M-t5aQK2PS22Gk4E2d43v8aWd22f3c9a9g',
                                widthPx: 4032,
                                heightPx: 3024,
                                authorAttributions: [
                                    {
                                        displayName: 'User',
                                        uri: '//maps.google.com/maps/contrib/102838089695428168000/reviews',
                                        photoUri: '//lh3.googleusercontent.com/a-/AD_cMMQ_Z-g'
                                    }
                                ]
                            }
                        ],
                        dayIndex: 0,
                        orderIndex: 0
                    },
                    {
                        id: 'ChIJH728e7-MGGARoO3s2pYk3tI',
                        displayName: { text: 'Sensō-ji', languageCode: 'en' },
                        formattedAddress: '2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan',
                        location: { latitude: 35.714765, longitude: 139.796655 },
                        photos: [
                            {
                                name: 'places/ChIJH728e7-MGGARoO3s2pYk3tI/photos/AUacShh3_A0',
                                widthPx: 4032,
                                heightPx: 3024,
                                authorAttributions: [
                                    {
                                        displayName: 'User',
                                        uri: '//maps.google.com/maps/contrib/102838089695428168000/reviews',
                                        photoUri: '//lh3.googleusercontent.com/a-/AD_cMMQ_Z-g'
                                    }
                                ]
                            }
                        ],
                        dayIndex: 0,
                        orderIndex: 1
                    },
                    {
                        id: 'ChIJ1_64s4iLGGARd-l-2fS22fI',
                        displayName: { text: 'Meiji Jingu', languageCode: 'en' },
                        formattedAddress: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo 151-8557, Japan',
                        location: { latitude: 35.676398, longitude: 139.699329 },
                        photos: [
                            {
                                name: 'places/ChIJ1_64s4iLGGARd-l-2fS22fI/photos/AUacShg3_A0',
                                widthPx: 4032,
                                heightPx: 3024,
                                authorAttributions: [
                                    {
                                        displayName: 'User',
                                        uri: '//maps.google.com/maps/contrib/102838089695428168000/reviews',
                                        photoUri: '//lh3.googleusercontent.com/a-/AD_cMMQ_Z-g'
                                    }
                                ]
                            }
                        ],
                        dayIndex: 1,
                        orderIndex: 0
                    }
                ],
                currentStage: 5,
                isPaid: true,
            };

            const session = getStoredSession() || initializeSession();
            Object.assign(session, mockSession);
            localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session));
            savedPlacesManager.reset();
            mockSession.savedPlaces.forEach(place => savedPlacesManager.addPlace(place));
            
            setTravelDetails(mockSession);
            setIsDetailsReady(true);
            setCurrentStage(5);
            setIsPaid(true);
            // handleGenerateItinerary(); // Removed from here
        }
    }, [router.query.test]);

    // New useEffect to call handleGenerateItinerary after travelDetails is ready
    useEffect(() => {
        if (router.query.test === 'true' && isDetailsReady && travelDetails.destination) {
            handleGenerateItinerary();
        }
    }, [router.query.test, isDetailsReady, travelDetails.destination]);

    // Listener to check payment status
    useEffect(() => {
        const checkPaymentStatus = () => {
            const status = getPaymentStatus();
            setIsPaid(status);
            };
            
            // Check initially
            checkPaymentStatus();
            
            // Set up interval to check periodically
            const interval = setInterval(checkPaymentStatus, 5000); // Check every 5 seconds
            
            // Cleanup
            return () => clearInterval(interval);
        }, []);
        
    useEffect(() => {
            // Check if we're on mobile
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768);
                setShowMap(window.innerWidth >= 768);
            };
            
            // Initial check
            checkMobile();
            
            // Add resize listener
            window.addEventListener('resize', checkMobile);
            
            // Cleanup
            return () => window.removeEventListener('resize', checkMobile);
        }, []);
        
    useEffect(() => {
            if (!router.isReady) {
                return;
            }
            if (router.query.test === 'true') {
                return;
            }
            console.log('[Index] Checking for session');
            const session = getStoredSession();
            console.log('[Index] Retrieved session from storage:', {
                hasSession: !!session,
                destination: session?.destination,
                sessionId: session?.sessionId,
                callStack: new Error().stack
            });
            
            // First check session validity
            if (!checkSessionValidity()) {
                console.error('[Index] Session is invalid or expired');
                window.location.replace('/travel-form');
                return;
            }
            
            // Then validate required session data
            if (!session || !session.sessionId) {
                console.error('[Index] Session ID missing');
                window.location.replace('/travel-form');
                return;
            }
            
            // Update lastActive timestamp
            updateLastActive();
            setSessionId(session.sessionId as string);
            
            // Then validate session data
            if (!session.destination || !session.startDate || !session.endDate || 
                !session.preferences || !session.preferences.length || 
                !session.startTime || 
                !session.lastActive || !session.expiresAt) {
                    console.error('[Index] Invalid session data:', {
                        hasDestination: !!session?.destination,
                        hasStartDate: !!session?.startDate,
                        hasEndDate: !!session?.endDate,
                        preferencesLength: session?.preferences?.length,
                        hasStartTime: !!session?.startTime,
                        hasLastActive: !!session?.lastActive,
                        hasExpiresAt: !!session?.expiresAt,
                        callStack: new Error().stack
                    });
                    window.location.replace('/travel-form');
                    return;
                }
                
                const travelDetails = {
                    destination: session.destination,
                    startDate: session.startDate,
                    endDate: session.endDate,
                    preferences: session.preferences,
                    budget: session.budget || '',
                    language: session.language || '',
                    transport: session.transport || []
                };
                
                console.log('[Index] Setting travel details:', travelDetails);
                setTravelDetails(travelDetails);
                setIsDetailsReady(true);
                setCurrentStage(session.currentStage);
                setIsPaid(session.isPaid);
            }, [router.query.test, router.isReady]);

            useEffect(() => {
                if (!travelDetails.destination || !isDetailsReady) return;
                
                const fetchCoordinates = async () => {
                    try {
                        const res = await fetch('/api/maps/geocode', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                address: travelDetails.destination 
                            })
                        });
                        
                        if (!res.ok) {
                            throw new Error(`Failed to fetch coordinates: ${res.status}`);
                        }
                        
                        const data = await res.json();
                        if (data.location) {
                            setTravelDetails(prevDetails => ({
                                ...prevDetails,
                                location: data.location
                            }));
                            
                            // Store location in session
                            updateSessionLocation(data.location);
                        }
                    } catch (error) {
                        console.error('Error fetching coordinates:', error);
                    }
                };
                
                fetchCoordinates();
            }, [travelDetails.destination, isDetailsReady]);
            
            useEffect(() => {
                (window as any).setShowPaymentSuccess = setShowPaymentSuccess;
                (window as any).setCurrentStage = setCurrentStage;
            }, []);
            
            const handlePlaceRemoved = (placeId: string) => {
                console.log('Place removed:', placeId);
                setSavedPlacesUpdate(prev => prev + 1);
            };
            
            return (
                // Main
                <div className="flex flex-col h-dvh w-full overflow-hidden bg-white">
                
                {/* Window header - fixed height */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-2 bg-light-blue/60 dark:bg-gray-900 transition-colors duration-400 print:hidden">
                {/* Logo and Brand Name */}
                <Link href="/" className="flex items-center my-auto gap-x-1">
                <Image
                src="/images/travel-rizz.png"
                alt="Travel-Rizz Logo"
                width={48}
                height={48}
                className="h-12 md:w-12 flex my-auto object-contain dark:invert dark:brightness-0 dark:contrast-200 transition-colors duration-400"
                />
                <span className={`text-3xl h-min my-auto hidden xl:flex text-primary text-nowrap dark:text-white font-caveat transition-colors duration-400`}>Travel-Rizz</span>
                </Link>
                
                <StageProgress 
                currentStage={currentStage} 
                isPaid={isPaid}
                onGenerateItinerary={handleGenerateItinerary}
                />
                <div className="flex items-center justify-center bg-sky-200/80 dark:bg-blue-900 rounded-md h-min my-auto p-2 transition-colors duration-400">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-6 h-6 relative"
                >
                <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0 text-secondary hover:text-primary dark:text-white" />
                <Moon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-gray-300 hover:text-white" />
                <span className="sr-only">Toggle theme</span>
                </Button>
                </div>
                </div>
                
                {/* Main content - Chat and Map - takes remaining height */}
                <main className="flex-1 flex relative bg-white h-max overflow-y-hidden">
                {currentStage < 5 ? (
                    <>
                    <div className={`${isMobile ? 'w-full' : 'w-[50%]'} h-auto overflow-y-hidden border-r border-gray-200 dark:border-gray-700`}>
                    {isDetailsReady ? (
                        <>
                        {currentStage < 4 && (
                            <TravelChatComponent 
                            initialDetails={travelDetails} 
                            onPlaceRemoved={handlePlaceRemoved}
                            currentStage={currentStage}
                            onStageUpdate={setCurrentStage}
                            />
                        )}
                        {currentStage === 4 && (
                            <ItineraryPlanner 
                            onPlaceRemoved={handlePlaceRemoved}
                            />
                        )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading travel details...</p>
                        </div>
                    )}
                    </div>
                    {(showMap || !isMobile) && currentStage < 5 && (
                        <div className={`${isMobile ? 'fixed inset-0 z-40 h-[100dvh]' : 'w-[50%]'} 
                                ${isMobile && !showMap ? 'hidden' : ''}`}>
                            {mapsApiStatus === 'ready' && travelDetails.destination ? (
                                <MapComponent
                                    city={travelDetails.destination}
                                    theme={theme as 'light' | 'dark'}
                                    key={`map-${savedPlacesUpdate}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-sky-blue">{mapsApiStatus === 'loading' ? 'Loading Map...' : 'Please enter a destination'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {isMobile && currentStage < 5 && (
                        <button
                        onClick={() => setShowMap(!showMap)}
                        className="fixed top-[124px] right-3 z-[50] border border-gray-200 dark:border-0 
                            bg-white dark:bg-blue-900 p-3 rounded-lg dark:shadow-gray-900 shadow-md"
                        >
                        <Map className={`h-5 w-5 text-sky-400 dark:text-gray-300`} />
                        </button>
                    )}
                    </>
                ) : (
                    <div className="w-full h-full overflow-y-scroll">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <ItineraryExport itineraryData={itineraryData} />
                        )}
                    </div>
                )}
                </main>
                {showPaymentSuccess && (
                    <PaymentSuccessPopup
                    isOpen={showPaymentSuccess}
                    onClose={() => setShowPaymentSuccess(false)}
                    title={tComp('paymentSuccessPopup.heading')}
                    description={tComp('paymentSuccessPopup.description')}
                    showConfetti={true} // Enable confetti for payment success
                    />
                )}
                {/* {showPremiumModal && (
                    <PremiumUpgradeModal 
                    isOpen={showPremiumModal} 
                    onClose={() => setShowPremiumModal(false)}
                    
                    />
                    )} */}
                    </div>
                );
            }
            
            export async function getStaticProps({ locale }: { locale: string }) {
                return {
                    props: {
                        messages: {
                            travelChat: (await import(`../../public/locales/${locale}/travel-chat.json`)).default,
                            parameters: (await import(`../../public/locales/${locale}/parameters.json`)).default,
                            components: (await import(`../../public/locales/${locale}/components.json`)).default,
                            itineraryplanner: (await import(`../../public/locales/${locale}/itineraryplanner.json`)).default,
                            "itinerary-export": (await import(`../../public/locales/${locale}/itinerary-export.json`)).default
                        },
                        locale
                    }
                }
            }
