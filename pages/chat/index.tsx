// pages/index.tsx
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { TravelPreference, BudgetLevel, SupportedLanguage, TravelDetails, TravelSession } from '@/managers/types';
import { Place } from '@/managers/types';
import { getStoredSession, initializeSession, SESSION_CONFIG, checkSessionValidity, updateLastActive, getPaymentReference, setPaymentStatus, clearPaymentReference, getPaymentStatus, updateSessionLocation } from '../../managers/session-manager';
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
    const [apiKey, setApiKey] = useState('');
    const [apiError, setApiError] = useState('');
    const [isLoadingKey, setIsLoadingKey] = useState(true);
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
    const handleGenerateItinerary = () => {
        setCurrentStage(5); // Move to stage 5
    };
    const [currentStage, setCurrentStage] = useState<number>(1);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [savedPlacesUpdate, setSavedPlacesUpdate] = useState(0);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const tComp = useTranslations('components');

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

        // Then trigger Maps API key fetch if needed
        if (!apiKey && !isLoadingKey) {
            setIsLoadingKey(true); // Only set if we're not already loading
        }
    }, []);

    useEffect(() => {
        const fetchMapKey = async () => {
            try {
                console.log('[Index] Fetching Maps API key...');
                // Add cache-control headers and explicit API path
                const response = await fetch('/api/maps-key', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    // Add cache busting and explicit next handling
                    cache: 'no-store',
                    next: { revalidate: 0 }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (!data.key) {
                    throw new Error('No API key in response');
                }
                
                console.log('[Index] Successfully fetched Maps API key');
                setApiKey(data.key);
            } catch (error) {
                console.error('[Index] Error fetching Maps API key:', error);
                setApiError('Failed to load Google Maps');
            } finally {
                setIsLoadingKey(false);
            }
        };
        
        if (!isLoadingKey || apiKey || !sessionId) return;

        fetchMapKey();
    }, [isLoadingKey, apiKey, sessionId]);

    useEffect(() => {
        if (!travelDetails.destination || !apiKey || !isDetailsReady) return;

        const fetchCoordinates = async () => {
            try {
                const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(travelDetails.destination as string)}&key=${apiKey}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch coordinates: ${res.status}`);
                }
                const data = await res.json();
                console.log('Geocoding API Response:', data);
                
                if (data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    console.log('Parsed Location:', location);
                    
                    // Update both travel details and session
                    const newLocation = {
                        latitude: location.lat,
                        longitude: location.lng
                    };
                    
                    setTravelDetails(prevDetails => ({
                        ...prevDetails,
                        location: newLocation
                    }));
                    
                    // Store location in session
                    updateSessionLocation(newLocation);
                }
            } catch (error) {
                console.error('Error fetching coordinates:', error);
            }
        };

        fetchCoordinates();
    }, [travelDetails.destination, apiKey, isDetailsReady]);

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
                                {apiKey ? (
                                    <MapComponent
                                        city={travelDetails.destination || ''}
                                        apiKey={apiKey}
                                        theme={theme as 'light' | 'dark'}
                                        key={`map-${savedPlacesUpdate}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-sky-blue">{apiError || 'Loading map...'}</p>
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
                        <ItineraryExport />
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
                itineraryplanner: (await import(`../../public/locales/${locale}/itineraryplanner.json`)).default
            },
            locale
        }
    }
}
