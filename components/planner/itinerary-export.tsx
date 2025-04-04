"use client"

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react"
import { Place, TravelDetails } from '@/managers/types';
import { getStoredSession, checkSessionValidity, updateLastActive, updateSessionLocation } from '../../managers/session-manager';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalizedFont } from "@/hooks/useLocalizedFont"

import {
    Calendar,
    CreditCard,
    Download,
    Globe,
    Info,
    MapPin,
    Phone,
    Plane,
    Sun,
    Sunrise,
    Sunset,
    Languages,
    Users,
    Umbrella,
    Cloud,
    CloudRain,
    CloudLightning,
    Snowflake,
    Compass,
    Clock,
    Map,
    AlertTriangle
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

const MapComponent = dynamic(() => import('@/components/features/map-component'), {
    ssr: false,
})

interface TripData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    preferences: string[];
    savedPlaces: Place[];
}

interface ItineraryData {
    cityInfo: {
        intro: string;
        weather: string;
        language: string;
        population: string;
        weatherForecast: Array<{
            day: string;
            temp: number;
            high: number;
            low: number;
            icon: string;
        }>;
    };
    travelDetails: {
        currency: string;
        safety: string;
        businessHours: string;
        navigation: string;
        localTips: string;
    };
    travelReminders: {
        documents: string;
        taxRefund: string;
        etiquette: string;
        health: string;
    };
    emergencyContacts: {
        emergency: string;
        hospitals: Array<{
            name: string;
            address: string;
            phone: string;
            notes: string;
        }>;
        embassy: string;
    };
    dailyItinerary: {
        schedule: Array<{
            day: number;
            date: string;
            schedule: Array<{
                time: "Morning" | "Afternoon" | "Evening";
                activities: Array<{
                    name: string;
                    description: string;
                }>;
            }>;
        }>;
    };
}

type SessionData = {
    messages: any[];
    travelDetails: TravelDetails;
    savedPlaces: Place[];
    currentStage: number;
    isPaid: boolean;
};

export default function ItineraryExport({ itineraryData }: { itineraryData: ItineraryData }) {
    const [apiKey, setApiKey] = useState('');
    const [apiError, setApiError] = useState('');
    const [sessionId, setSessionId] = useState<string>('');
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [currentStage, setCurrentStage] = useState<number>(1);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [tripData, setTripData] = useState<TripData | null>(null)
    const font = useLocalizedFont()
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

    // Handle image errors by moving to the next photo
    const handleImageError = (placeId: string) => {
        setCurrentPhotoIndex(prev => {
            const place = tripData?.savedPlaces?.find(p => p.id === placeId);
            const photos = place?.photos || [];
            return prev < photos.length - 1 ? prev + 1 : prev;
        });
    };
    
    // Default values for data sections
    const cityInfo = itineraryData.cityInfo || {
        intro: "City information not available.",
        weather: "Weather data not available.",
        language: "Language data not available.",
        population: "Population data not available.",
        weatherForecast: [],
    };

    const travelNotableDetails = itineraryData.travelDetails || {
        currency: "Not available.",
        safety: "Not available.",
        businessHours: "Not available.",
        navigation: "Not available.",
        localTips: "Not available.",
    };

    const travelReminders = itineraryData.travelReminders || {
        documents: "Not available.",
        taxRefund: "Not available.",
        etiquette: "Not available.",
        health: "Not available.",
    };

    const emergencyContacts = itineraryData.emergencyContacts || {
        emergency: "Not available.",
        hospitals: [],
        embassy: "Not available.",
    };

    const dailyItinerary = itineraryData.dailyItinerary?.schedule || [];

    const getWeatherIcon = (icon: string) => {
        switch (icon) {
            case "cloudy": return <Cloud className="h-5 w-5" />;
            case "sunny": return <Sun className="h-5 w-5" />;
            case "rainy": return <CloudRain className="h-5 w-5" />;
            case "snowy": return <Snowflake className="h-5 w-5" />;
            case "stormy": return <CloudLightning className="h-5 w-5" />;
            default: return <Umbrella className="h-5 w-5" />;
        }
    };
    
    useEffect(() => {
        const session = getStoredSession();
        
        // First check session validity
        if (!checkSessionValidity()) {
            console.error('[ItineraryExport] Session is invalid or expired');
            window.location.replace('/travel-form');
            return;
        }
        
        // Then validate required session data
        if (!session || !session.sessionId || !session.destination) {
            console.error('[ItineraryExport] Required session data missing');
            window.location.replace('/travel-form');
            return;
        }
        
        // Update lastActive timestamp
        updateLastActive();
        
        const travelDetails = {
            destination: session.destination,
            startDate: session.startDate,
            endDate: session.endDate,
            preferences: session.preferences,
            budget: session.budget,
            language: session.language,
            transport: session.transport,
            location: session.location
        };
        
        // Set trip data from session with proper defaults
        setTripData({
            destination: session.destination,
            startDate: session.startDate,
            endDate: session.endDate,
            budget: session.budget,
            preferences: session.preferences,
            savedPlaces: session.savedPlaces
        });
        
        setTravelDetails(travelDetails);
        setIsPaid(session.isPaid);
        setCurrentStage(session.currentStage);
        setMounted(true);
        setSessionId(session.sessionId as string);
    }, []);
    
    
    useEffect(() => {
        const fetchMapKey = async () => {
            if (!sessionId || apiKey) return;
            
            try {
                const response = await fetch('/api/maps-key', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    cache: 'no-store'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (!data.key) {
                    throw new Error('No API key in response');
                }
                
                setApiKey(data.key);
            } catch (error) {
                setApiError('Failed to load Google Maps');
            }
        };
        
        fetchMapKey();
    }, [sessionId, apiKey]);
    
    useEffect(() => {
        if (!travelDetails.destination || !apiKey) return;
        
        const fetchCoordinates = async () => {
            try {
                const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(travelDetails.destination)}&key=${apiKey}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch coordinates: ${res.status}`);
                }
                const data = await res.json();
                
                if (data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    const newLocation = {
                        latitude: location.lat,
                        longitude: location.lng
                    };
                    
                    setTravelDetails(prevDetails => ({
                        ...prevDetails,
                        location: newLocation
                    }));
                    
                    updateSessionLocation(newLocation);
                }
            } catch (error) {
                console.error('Error fetching coordinates:', error);
            }
        };
        
        fetchCoordinates();
    }, [travelDetails.destination, apiKey]);
    
    const handleExportPDF = () => {
        window.print()
        // In a real implementation, you might use a library like jsPDF or react-pdf
        // to generate a proper PDF instead of using the browser's print functionality
    }
    
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }
    
    if (!mounted || !tripData) return null
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800">
        
        {/* Header with controls - will not be printed */}
        <div className="sticky top-0 z-10 flex space-x-4 p-4 justify-end bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-sky-200 dark:border-slate-700 print:hidden">
        {/* Print and Export buttons */}
        <Button
        variant="default"
        size="sm"
        onClick={handleExportPDF}
        className={`${font.text} bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white`}
        >
        <Download className="h-4 w-4 mr-2" />
        Export PDF
        </Button>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* PDF Page 1 */}
        <section className="print:break-before-page">
        
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        {/* Itinerary Hero Container */}
        <div className="relative mb-12">
        {/* Decorative circles */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-full blur-xl "></div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-full blur-xl "></div>
        
        {/* Itinerary Hero Content */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-sky-100 dark:border-slate-700">        
        <div className="relative p-8 text-center">
        {/* Destination Name */}
        <h1 className={`${font.text} text-4xl h-full font-bold text-sky-600 dark:text-sky-400 mb-2`}>
        {tripData.destination}
        </h1>
        
        {/* Date Range */}
        <div className="flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
        <Calendar className="h-4 w-4 mr-2 text-sky-500 dark:text-sky-400" />
        <span className={`${font.text}`}>
        {tripData.startDate} to {tripData.endDate}
        </span>
        </div>
        
        {/* Budget and Preferences */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="inline-block bg-gradient-to-r from-sky-500/10 to-indigo-500/10 dark:from-sky-500/20 dark:to-indigo-500/20 text-sky-700 dark:text-sky-300 px-4 py-1.5 rounded-full text-sm font-medium border border-sky-200 dark:border-sky-800">
        {tripData.budget} $$
        </div>
        {tripData.preferences.map((pref, index) => (
            <div
            key={index}
            className="inline-block bg-gradient-to-r from-amber-500/10 to-pink-500/10 dark:from-amber-500/20 dark:to-pink-500/20 text-amber-700 dark:text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800 capitalize"
            >
            {pref}
            </div>
        ))}
        </div>
        
        {/* Weather Forecast */}
        <div className="flex justify-center items-center space-x-6 mt-6">
        {cityInfo.weatherForecast.map((day, index) => (
            <div key={index} className="text-center">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{day.day}</div>
                <div className="mt-1 w-10 h-10 mx-auto bg-gradient-to-br from-sky-400 to-indigo-400 rounded-full flex items-center justify-center text-white">
                    {getWeatherIcon(day.icon)}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-white">{day.temp}°</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    {day.low}° / {day.high}°
                </div>
            </div>
        ))}
        </div>
        
        </div>
        </div>
        </div>
        
        {/* City Introduction */}
        <div className="mb-12 relative">
        {/* City Introduction Decoration */}
        <div className="absolute -z-10 top-1/2 left-0 transform -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-full blur-xl"></div>
        
        {/* City Introduction Title Container */}
        <div className="flex items-center mb-6">
        {/* City Introduction Icon */}
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Globe className="h-5 w-5" />
        </div>
        <h2 className={`${font.text} text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text`}>
        City Introduction
        </h2>
        </div>
        
        {/* City Introduction Content */}
        <Card className={`${font.text} p-8 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden`}>
        {/* City Introduction Content Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full"></div>
        {/* City Introduction Content in two columns */}
        <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
        {/* About City */}
        <div>
        <div className="flex items-center mb-3">
        <Info className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">About Bangkok</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.intro}</p>
        </div>
        {/* Weather & Climate */}
        <div>
        <div className="flex items-center mb-3">
        <Umbrella className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Weather & Climate</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.weather}</p>
        </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
        {/* Languages Spoken */}
        <div>
        <div className="flex items-center mb-3">
        <Languages className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Languages Spoken</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.language}</p>
        </div>                            
        {/* Population */}
        <div>
        <div className="flex items-center mb-3">
        <Users className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Population</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.population}</p>
        </div>
        </div>
        
        </div>
        </Card>
        </div>
        </section>
        
        
        {/* PDF Page 2 - Travel Details Section*/}
        <section className="mb-12 relative print:break-before-page">
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute -z-10 top-1/2 right-0 transform -translate-y-1/2 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-pink-500/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center mb-6">
        {/* Icon */}
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Compass className="h-5 w-5" />
        </div>
        {/* Title */}
        <h2 className={`${font.text}text-2xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 dark:from-amber-400 dark:to-pink-400 text-transparent bg-clip-text`}>
        Notable Travel Details
        </h2>
        </div>
        
        {/* Travel DetailsCard */}
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-br-full"></div>
        {/* Travel Details Content in two columns */}
        <div className={`${font.text} grid md:grid-cols-2 gap-8`}>
        {/* Left Column */}
        <div className="space-y-6">
        {/* Currency Information */}
        <div>
        <div className="flex items-center mb-3">
        <CreditCard className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Currency Information</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelNotableDetails.currency}</p>
        </div>
        
        {/* Safety Tips */}
        <div>
        <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Safety Tips</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelNotableDetails.safety}</p>
        </div>
        
        {/* Local Tips */}
        <div>
        <div className="flex items-center mb-3">
        <Map className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Local Tips</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelNotableDetails.localTips}</p>
        </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
        {/* Business Operating Hours */}
        <div>
        <div className="flex items-center mb-3">
        <Clock className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Business Operating Hours</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelNotableDetails.businessHours}</p>
        </div>
        
        {/* Local Navigation */}
        <div>
        <div className="flex items-center mb-3">
        <MapPin className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Local Navigation</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelNotableDetails.navigation}</p>
        </div>
        </div>
        </div>
        </Card>
        </section>
        
        {/* Map with Saved Places */}
        <section className="mb-12 print:break-before-page">
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        {/* Title and Logo */}
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
        <MapPin className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
        Map of Saved Places
        </h2>
        </div>
        
        <Card className="p-0 overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-800">
        <div className="aspect-video relative">
        {apiKey && travelDetails.destination ? (
            <MapComponent
            city={travelDetails.destination}
            apiKey={apiKey}
            theme={theme as 'light' | 'dark'}
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
            <p className="text-sky-blue">{apiError || 'Loading map...'}</p>
            </div>
        )}
        </div>
        
        {/* Saved Places */}
        <div className="p-8">
        <h3 className={`${font.text} font-semibold text-xl mb-6 text-slate-800 dark:text-white`}>Saved Places</h3>
        {/* Saved Places Grid*/}
        <div className="grid md:grid-cols-2 gap-6">
        {tripData?.savedPlaces?.map((place) => (
            <div
            key={place.id}
            className={`${font.text} flex items-start bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/30 dark:to-indigo-900/30 p-4 rounded-lg border border-sky-100 dark:border-slate-700`}
            >
            <div className="relative w-24 h-24 mr-4 my-auto rounded-lg overflow-hidden shrink-0">
            {/* Permanent placeholder */}
            <img
            src="/images/placeholder-image.jpg"
            alt={typeof place.displayName === 'string' ? place.displayName : place.displayName?.text || 'Place image'}
            className="w-full h-full object-cover filter blur-[2px]"
            />
            
            {/* Conditional actual photo */}
            {place.photos && place.photos.length > 0 && (
                <img
                src={`/api/places/photos?photoName=${place.photos[currentPhotoIndex].name}&maxWidth=400`}
                onError={() => handleImageError(place.id)}
                className="w-full h-full object-cover absolute inset-0"
                alt=""
                />
            )}
            </div>
            <div>
            <h4 className="font-medium text-slate-800 dark:text-white">
            {typeof place.displayName === 'string' ? place.displayName : place.displayName.text}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{place.formattedAddress}</p>
            <div className="flex items-center mt-2">
            {place.rating && (
                <span className="text-sm bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full mr-2 font-medium">
                {place.rating} ★
                </span>
            )}
            {place.primaryType && (
                <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {place.primaryType.replace(/_/g, " ")}
                </span>
            )}
            </div>
            </div>
            </div>
        ))}
        </div>
        </div>
        </Card>
        </section>
        
        {/* Daily Itinerary */}
        <section className={`${font.text} mb-12 relative print:break-before-page`}>
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        {/* Gradient background */}
        <div className="absolute -z-10 top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        
        {/* Daily Itinerary Title and Logo */}
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Calendar className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
        Daily Itinerary
        </h2>
        </div>
        
        {/* Daily Itinerary Tabs */}
        <Tabs defaultValue="day1" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-md border border-sky-100 dark:border-slate-700">
        <TabsTrigger
        value="day1"
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
        >
        Day 1
        </TabsTrigger>
        <TabsTrigger
        value="day2"
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
        >
        Day 2
        </TabsTrigger>
        <TabsTrigger
        value="day3"
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
        >
        Day 3
        </TabsTrigger>
        </TabsList>
        
        {/* All daily itinerary for printing and exporting */}
        <div className="hidden print:block space-y-8">
        {dailyItinerary.map((day: any) => (
            <Card key={day.day} className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent dark:from-sky-500/20 rounded-bl-full"></div>
            
            <h3 className="text-xl font-bold text-sky-600 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-sky-500" />
            Day {day.day}: {day.date}
            </h3>
            
            <div className="space-y-8">
            {day.schedule.map((timeSlot: any) => (
                <div key={timeSlot.time} className="relative">
                <div className="flex items-center mb-4">
                {timeSlot.time === "Morning" && <Sunrise className="h-5 w-5 mr-2 text-amber-500" />}
                {timeSlot.time === "Afternoon" && <Sun className="h-5 w-5 mr-2 text-amber-500" />}
                {timeSlot.time === "Evening" && <Sunset className="h-5 w-5 mr-2 text-amber-500" />}
                <h4 className="text-lg font-medium text-amber-600">{timeSlot.time}</h4>
                </div>
                
                <div className="space-y-4 pl-6 border-l-2 border-amber-200">
                {timeSlot.activities.map((activity: any, index: number) => (
                    <div
                    key={index}
                    className="ml-2 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 rounded-lg border border-amber-200"
                    >
                    <h5 className="font-medium text-slate-800">{activity.name}</h5>
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                    </div>
                ))}
                </div>
                </div>
            ))}
            </div>
            </Card>
        ))}
        </div>
        
        {/* For screen, show tabs */}
        {dailyItinerary.map((day: any) => (
            <TabsContent key={day.day} value={`day${day.day}`} className="">
            <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden relative">
            
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent dark:from-sky-500/20 rounded-bl-full"></div>
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
            Day {day.day}: {day.date}
            </h3>
            
            <div className="space-y-8">
            {day.schedule.map((timeSlot: any) => (
                <div key={timeSlot.time} className="relative">
                <div className="flex items-center mb-4">
                {timeSlot.time === "Morning" && (
                    <Sunrise className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
                )}
                {timeSlot.time === "Afternoon" && (
                    <Sun className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
                )}
                {timeSlot.time === "Evening" && (
                    <Sunset className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
                )}
                <h4 className="text-lg font-medium text-amber-600 dark:text-amber-400">{timeSlot.time}</h4>
                </div>
                
                <div className="space-y-4 pl-6 border-l-2 border-amber-200 dark:border-amber-800">
                {timeSlot.activities.map((activity: any, index: number) => (
                    <div
                    key={index}
                    className="ml-2 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                    <h5 className="font-medium text-slate-800 dark:text-white">{activity.name}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{activity.description}</p>
                    </div>
                ))}
                </div>
                </div>
            ))}
            </div>
            </Card>
            </TabsContent>
        ))}
        </Tabs>
        </section>
        
        {/* Travel Reminders */}
        <section className={`${font.text} mb-12 relative print:break-before-page`}>
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        {/* Decoration */}
        <div className="absolute -z-10 top-1/2 right-0 transform -translate-y-1/2 w-40 h-40 bg-gradient-to-bl from-pink-500/10 to-purple-500/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
        <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 text-transparent bg-clip-text">
        Travel Reminders
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent dark:from-pink-500/20 rounded-br-full"></div>
        
        <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-900/30 dark:to-pink-800/20 p-5 rounded-lg border border-pink-200 dark:border-pink-800">
        <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 mr-2 text-pink-500 dark:text-pink-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Travel Documents & Visa</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelReminders.documents}</p>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-900/30 dark:to-pink-800/20 p-5 rounded-lg border border-pink-200 dark:border-pink-800">
        <div className="flex items-center mb-3">
        <CreditCard className="h-5 w-5 mr-2 text-pink-500 dark:text-pink-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Tax Refund Procedure</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelReminders.taxRefund}</p>
        </div>
        </div>
        
        <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center mb-3">
        <Info className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
        Local Etiquette & Cultural Norms
        </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelReminders.etiquette}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center mb-3">
        <Umbrella className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Health & Vaccination</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelReminders.health}</p>
        </div>
        </div>
        </div>
        </Card>
        </section>
        
        {/* Emergency Contacts */}
        <section className={`${font.text} mb-12 print:break-before-page`}>
        {/* Printed Page Header */}
        <div className="hidden print:flex print:flex-row print:justify-start p-4">
        <Image
        src="/images/travel-rizz.png"
        alt="Travel-Rizz Logo"
        width={48}
        height={48}
        className="h-10 w-10 flex my-auto dark:invert dark:brightness-0 dark:contrast-200"
        />
        <span className={`text-xl h-min my-auto text-primary text-nowrap dark:text-white font-caveat`}>Travel-Rizz</span>
        </div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Phone className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 text-transparent bg-clip-text">
        Emergency Contacts
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent dark:from-red-500/20 rounded-bl-full"></div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 p-5 rounded-lg border border-red-200 dark:border-red-800 mb-6">
        <div className="flex items-center mb-3">
        <Phone className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Local Emergency Numbers</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{emergencyContacts.emergency}</p>
        </div>
        
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
        Hospitals
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
        {emergencyContacts.hospitals.map((hospital, index) => (
            <div
            key={index}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-red-200 dark:border-red-800 shadow-sm"
            >
            <h4 className="font-medium text-slate-800 dark:text-white">{hospital.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{hospital.address}</p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">{hospital.phone}</p>
            <p className="text-sm italic text-slate-500 dark:text-slate-400 mt-1">{hospital.notes}</p>
            </div>
        ))}
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-900/30 dark:to-pink-800/20 p-5 rounded-lg border border-pink-200 dark:border-pink-800">
        <div className="flex items-center mb-3">
        <Globe className="h-5 w-5 mr-2 text-pink-500 dark:text-pink-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Embassy Information</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{emergencyContacts.embassy}</p>
        </div>
        </Card>
        </section>
        
        {/* Footer */}
        <footer className={`${font.text} text-center mt-16 mb-8`}>
        <div className="inline-flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-full shadow-md mb-4 border-2 border-sky-100 dark:border-slate-700">
        <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
        <Plane className="h-6 w-6 rotate-45" />
        </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300">
        Itinerary created with Travel-Rizz on {new Date().toLocaleDateString()}
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
        For updates or changes to your itinerary, visit travelrizz.app
        </p>
        </footer>
        </div>
        </div>
    )
}
