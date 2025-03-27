"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    MapPin,
    Calendar,
    Info,
    AlertTriangle,
    Phone,
    Sun,
    Moon,
    Download,
    Printer,
    Plane,
    Globe,
    Compass,
    Sunrise,
    Sunset,
    CreditCard,
    Languages,
    Users,
    Umbrella,
    Clock,
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { getStoredSession } from '@/managers/session-manager';

interface TripData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    preferences: string[];
    savedPlaces: any[];
}

interface Place {
    id: string;
    displayName: { text: string; languageCode: string };
    formattedAddress: string;
    primaryType: string;
    rating: number;
    openNow: boolean;
}

// City information
const cityInfo = {
    intro:
    "Bangkok, Thailand's capital, is a vibrant metropolis known for its ornate shrines, bustling street life, and modern urban landscape. The city blends traditional Thai culture with contemporary influences, creating a unique and dynamic atmosphere.",
    weather:
    "Bangkok has a tropical climate with high temperatures year-round. March is in the hot season with average temperatures between 28°C-34°C (82°F-93°F). Occasional afternoon thunderstorms may occur.",
    language:
    "Thai is the official language, though English is widely spoken in tourist areas, luxury hotels, and shopping centers. Learning a few basic Thai phrases is appreciated by locals.",
    population:
    "Bangkok is home to approximately 10.5 million people in the metropolitan area, making it Thailand's most populous city and a major urban center in Southeast Asia.",
}

// Travel details
const travelDetails = {
    currency:
    "The official currency is the Thai Baht (THB). As of March 2025, 1 USD ≈ 32 THB. ATMs are widely available, and credit cards are accepted at most established businesses.",
    safety:
    "Bangkok is generally safe for tourists, but be cautious of pickpocketing in crowded areas. Avoid political demonstrations and be wary of common scams targeting tourists. Always use licensed taxis or ride-sharing services.",
    businessHours:
    "Most shops open around 10:00 AM and close between 8:00-10:00 PM. Government offices operate from 8:30 AM to 4:30 PM, Monday to Friday. Shopping malls typically open from 10:00 AM to 10:00 PM daily.",
    navigation:
    "The BTS Skytrain and MRT subway are efficient ways to navigate the city while avoiding traffic. Taxis, tuk-tuks, and ride-sharing services are also widely available. Consider using boat services on the Chao Phraya River to reach riverside attractions.",
}

// Emergency contacts
const emergencyContacts = {
    emergency: "Tourist Police: 1155 (English-speaking), General Emergency: 191, Medical Emergency: 1669",
    hospitals: [
        {
            name: "Bumrungrad International Hospital",
            address: "33 Sukhumvit 3 (Soi Nana Nua), Wattana, Bangkok 10110",
            phone: "+66 2066 8888",
            notes: "International hospital with English-speaking staff",
        },
        {
            name: "Bangkok Hospital",
            address: "2 Soi Soonvijai 7, New Petchburi Rd, Bangkok 10310",
            phone: "+66 2310 3000",
            notes: "24-hour emergency services with international standards",
        },
    ],
    embassy:
    "Contact your country's embassy in case of emergency. Most embassies are located in the Pathum Wan and Watthana districts.",
}

// Travel reminders
const travelReminders = {
    documents:
    "Ensure your passport is valid for at least 6 months beyond your planned departure date. Most visitors can obtain a 30-day visa exemption upon arrival, but check specific requirements for your nationality.",
    taxRefund:
    "Tourists can claim VAT refunds for goods purchased at participating stores (minimum 2,000 THB per store, total minimum 5,000 THB). Keep your receipts and present them at the VAT refund counter at the airport before departure.",
    etiquette:
    "Remove shoes when entering temples and homes. Dress modestly when visiting religious sites (covered shoulders and knees). The Thai Royal Family is deeply revered; always show respect when discussing or in the presence of royal imagery.",
    health:
    "No mandatory vaccinations are required for entry, but hepatitis A, typhoid, and tetanus vaccines are recommended. Drink bottled water and use insect repellent. Travel insurance with medical coverage is highly recommended.",
}

// Daily itinerary
const dailyItinerary = [
    {
        day: 1,
        date: "March 27, 2025",
        schedule: [
            {
                time: "Morning",
                activities: [
                    {
                        name: "Breakfast at hotel",
                        description:
                        "Start your day with a luxurious breakfast buffet featuring both international and Thai cuisine.",
                    },
                    {
                        name: "Wat Phra Chetuphon (Wat Pho)",
                        description:
                        "Visit the famous Temple of the Reclining Buddha, one of Bangkok's oldest and largest temples.",
                    },
                ],
            },
            {
                time: "Afternoon",
                activities: [
                    {
                        name: "Lunch at a riverside restaurant",
                        description: "Enjoy authentic Thai cuisine with views of the Chao Phraya River.",
                    },
                    {
                        name: "Grand Palace & Wat Phra Kaew",
                        description:
                        "Explore the former royal residence and Temple of the Emerald Buddha, Thailand's most sacred Buddhist temple.",
                    },
                ],
            },
            {
                time: "Evening",
                activities: [
                    {
                        name: "Dinner at ICONSIAM",
                        description:
                        "Experience upscale dining at one of Bangkok's premier shopping destinations with river views.",
                    },
                    {
                        name: "River cruise",
                        description:
                        "Take a relaxing evening cruise along the Chao Phraya River to see Bangkok's illuminated landmarks.",
                    },
                ],
            },
        ],
    },
    {
        day: 2,
        date: "March 28, 2025",
        schedule: [
            {
                time: "Morning",
                activities: [
                    {
                        name: "Breakfast at hotel",
                        description: "Enjoy another delicious breakfast to start your day.",
                    },
                    {
                        name: "Chatuchak Weekend Market",
                        description:
                        "Explore one of the world's largest weekend markets with over 8,000 stalls selling everything from clothing to antiques.",
                    },
                ],
            },
            {
                time: "Afternoon",
                activities: [
                    {
                        name: "Lunch at a local eatery",
                        description: "Try some authentic street food at recommended vendors in the market area.",
                    },
                    {
                        name: "Jim Thompson House",
                        description:
                        "Visit the beautiful teak house museum of American businessman Jim Thompson, who revitalized the Thai silk industry.",
                    },
                ],
            },
            {
                time: "Evening",
                activities: [
                    {
                        name: "Dinner at Sala Rim Naam",
                        description: "Experience traditional Thai cuisine accompanied by classical dance performances.",
                    },
                    {
                        name: "Asiatique The Riverfront",
                        description:
                        "Explore this large open-air mall combining shopping, dining, and entertainment along the riverfront.",
                    },
                ],
            },
        ],
    },
    {
        day: 3,
        date: "March 29, 2025",
        schedule: [
            {
                time: "Morning",
                activities: [
                    {
                        name: "Breakfast at hotel",
                        description: "Enjoy your final breakfast in Bangkok.",
                    },
                    {
                        name: "Damnoen Saduak Floating Market (half-day tour)",
                        description: "Take a morning tour to experience this colorful floating market outside Bangkok.",
                    },
                ],
            },
            {
                time: "Afternoon",
                activities: [
                    {
                        name: "Lunch at Central World",
                        description: "Dine at one of the many international or Thai restaurants in this massive shopping complex.",
                    },
                    {
                        name: "Shopping at Siam Paragon",
                        description: "Enjoy luxury shopping at one of Bangkok's premier malls for souvenirs and personal items.",
                    },
                ],
            },
            {
                time: "Evening",
                activities: [
                    {
                        name: "Farewell dinner at Vertigo Restaurant",
                        description: "Experience rooftop dining with panoramic views of Bangkok's skyline.",
                    },
                    {
                        name: "Pack and prepare for departure",
                        description: "Organize your belongings and prepare for your journey home or to your next destination.",
                    },
                ],
            },
        ],
    },
]

// Weather forecast data
const weatherForecast = [
    { day: "Mar 27", temp: 31, high: 34, low: 28, icon: "cloudy" },
    { day: "Mar 28", temp: 32, high: 36, low: 28, icon: "cloudy" },
    { day: "Mar 29", temp: 31, high: 35, low: 28, icon: "cloudy" },
]

export default function ItineraryExport() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [tripData, setTripData] = useState<TripData | null>(null)
    
    useEffect(() => {
        setMounted(true)
        const session = getStoredSession()
        if (session) {
            setTripData({
                destination: session.destination,
                startDate: session.startDate,
                endDate: session.endDate,
                budget: session.budget,
                preferences: session.preferences,
                savedPlaces: session.savedPlaces
            })
        }
    }, [])
    
    const handlePrint = () => {
        window.print()
    }
    
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
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 print:bg-white">
        {/* Header with controls - will not be printed */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-sky-200 dark:border-slate-700 print:hidden">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
        <div className="h-10 w-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
        <Plane className="h-5 w-5 rotate-45" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
        Travel-Rizz
        </h1>
        </div>
        <div className="flex items-center space-x-4">
        <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="border-sky-200 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
        >
        {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
        ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
        )}
        </Button>
        <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="border-sky-200 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
        >
        <Printer className="h-4 w-4 mr-2 text-sky-600 dark:text-sky-400" />
        Print
        </Button>
        <Button
        variant="default"
        size="sm"
        onClick={handleExportPDF}
        className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white"
        >
        <Download className="h-4 w-4 mr-2" />
        Export PDF
        </Button>
        </div>
        </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 py-8 max-w-5xl print:py-2">
        {/* Itinerary Header */}
        <div className="relative mb-12 print:mb-8">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-full blur-xl print:hidden"></div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-full blur-xl print:hidden"></div>
        
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-sky-100 dark:border-slate-700">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-400 to-indigo-500 print:hidden"></div>
        <div className="absolute top-0 left-0 w-full h-24 bg-[url('/placeholder.svg?height=200&width=1000')] bg-cover bg-center opacity-20 print:hidden"></div>
        
        <div className="relative pt-16 pb-8 px-8 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-full shadow-md mb-4 border-2 border-sky-100 dark:border-slate-700 print:hidden">
        <div className="h-16 w-16 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
        <Plane className="h-8 w-8 rotate-45" />
        </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text mb-2">
        {tripData.destination}
        </h1>
        
        <div className="flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
        <Calendar className="h-4 w-4 mr-2 text-sky-500 dark:text-sky-400" />
        <span>
        {tripData.startDate} to {tripData.endDate}
        </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="inline-block bg-gradient-to-r from-sky-500/10 to-indigo-500/10 dark:from-sky-500/20 dark:to-indigo-500/20 text-sky-700 dark:text-sky-300 px-4 py-1.5 rounded-full text-sm font-medium border border-sky-200 dark:border-sky-800">
        {tripData.budget} Budget
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
        
        {/* Weather summary */}
        <div className="flex justify-center items-center space-x-6 mt-6 print:hidden">
        {weatherForecast.map((day, index) => (
            <div key={index} className="text-center">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{day.day}</div>
            <div className="mt-1 w-10 h-10 mx-auto bg-gradient-to-br from-sky-400 to-indigo-400 rounded-full flex items-center justify-center text-white">
            <Umbrella className="h-5 w-5" />
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
        <section className="mb-12 print:mb-8 relative">
        <div className="absolute -z-10 top-1/2 left-0 transform -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-full blur-xl print:hidden"></div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Globe className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
        City Introduction
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full print:hidden"></div>
        
        <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
        <div>
        <div className="flex items-center mb-3">
        <Info className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">About Bangkok</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.intro}</p>
        </div>
        
        <div>
        <div className="flex items-center mb-3">
        <Umbrella className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Weather & Climate</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.weather}</p>
        </div>
        </div>
        
        <div className="space-y-6">
        <div>
        <div className="flex items-center mb-3">
        <Languages className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Languages Spoken</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{cityInfo.language}</p>
        </div>
        
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
        </section>
        
        {/* Travel Details */}
        <section className="mb-12 print:mb-8 relative">
        <div className="absolute -z-10 top-1/2 right-0 transform -translate-y-1/2 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-pink-500/10 rounded-full blur-xl print:hidden"></div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Compass className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 dark:from-amber-400 dark:to-pink-400 text-transparent bg-clip-text">
        Notable Travel Details
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-br-full print:hidden"></div>
        
        <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
        <div>
        <div className="flex items-center mb-3">
        <CreditCard className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Currency Information</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelDetails.currency}</p>
        </div>
        
        <div>
        <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Safety Tips</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelDetails.safety}</p>
        </div>
        </div>
        
        <div className="space-y-6">
        <div>
        <div className="flex items-center mb-3">
        <Clock className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Business Operating Hours</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelDetails.businessHours}</p>
        </div>
        
        <div>
        <div className="flex items-center mb-3">
        <MapPin className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Local Navigation</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{travelDetails.navigation}</p>
        </div>
        </div>
        </div>
        </Card>
        </section>
        
        {/* Map with Saved Places */}
        <section className="mb-12 print:mb-8">
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
        <Image
        src="/placeholder.svg?height=600&width=1200"
        alt="Map of Bangkok with saved places"
        fill
        className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
        <p className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-md text-slate-800 dark:text-white">
        Interactive map would be displayed here
        </p>
        </div>
        </div>
        
        <div className="p-8">
        <h3 className="font-semibold text-xl mb-6 text-slate-800 dark:text-white">Saved Places</h3>
        <div className="grid md:grid-cols-2 gap-6">
        {tripData.savedPlaces.map((place) => (
            <div
            key={place.id}
            className="flex items-start bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/30 dark:to-indigo-900/30 p-4 rounded-lg border border-sky-100 dark:border-slate-700"
            >
            <div className="mr-4 mt-1 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md shrink-0">
            <MapPin className="h-5 w-5" />
            </div>
            <div>
            <h4 className="font-medium text-slate-800 dark:text-white">{place.displayName.text}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{place.formattedAddress}</p>
            <div className="flex items-center mt-2">
            <span className="text-sm bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full mr-2 font-medium">
            {place.rating} ★
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
            {place.primaryType.replace("_", " ")}
            </span>
            </div>
            </div>
            </div>
        ))}
        </div>
        </div>
        </Card>
        </section>
        
        {/* Daily Itinerary */}
        <section className="mb-12 print:mb-8 relative">
        <div className="absolute -z-10 top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 rounded-full blur-3xl print:hidden"></div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Calendar className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
        Daily Itinerary
        </h2>
        </div>
        
        <Tabs defaultValue="day1" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 print:hidden bg-white dark:bg-slate-800 p-1 rounded-lg shadow-md border border-sky-100 dark:border-slate-700">
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
        
        {/* For print, show all days */}
        <div className="hidden print:block space-y-8">
        {dailyItinerary.map((day) => (
            <Card key={day.day} className="p-6 border-0 shadow-lg bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full"></div>
            
            <h3 className="text-xl font-bold text-sky-600 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-sky-500" />
            Day {day.day}: {day.date}
            </h3>
            
            <div className="space-y-8">
            {day.schedule.map((timeSlot) => (
                <div key={timeSlot.time} className="relative">
                <div className="flex items-center mb-4">
                {timeSlot.time === "Morning" && <Sunrise className="h-5 w-5 mr-2 text-amber-500" />}
                {timeSlot.time === "Afternoon" && <Sun className="h-5 w-5 mr-2 text-amber-500" />}
                {timeSlot.time === "Evening" && <Sunset className="h-5 w-5 mr-2 text-amber-500" />}
                <h4 className="text-lg font-medium text-amber-600">{timeSlot.time}</h4>
                </div>
                
                <div className="space-y-4 pl-6 border-l-2 border-amber-200">
                {timeSlot.activities.map((activity, index) => (
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
        {dailyItinerary.map((day) => (
            <TabsContent key={day.day} value={`day${day.day}`} className="print:hidden">
            <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent dark:from-sky-500/20 rounded-bl-full"></div>
            
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
            Day {day.day}: {day.date}
            </h3>
            
            <div className="space-y-8">
            {day.schedule.map((timeSlot) => (
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
                {timeSlot.activities.map((activity, index) => (
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
        <section className="mb-12 print:mb-8 relative">
        <div className="absolute -z-10 top-1/2 right-0 transform -translate-y-1/2 w-40 h-40 bg-gradient-to-bl from-pink-500/10 to-purple-500/10 rounded-full blur-xl print:hidden"></div>
        
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
        <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 text-transparent bg-clip-text">
        Travel Reminders
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent dark:from-pink-500/20 rounded-br-full print:hidden"></div>
        
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
        <section className="mb-12 print:mb-8">
        <div className="flex items-center mb-6">
        <div className="mr-4 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
        <Phone className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 text-transparent bg-clip-text">
        Emergency Contacts
        </h2>
        </div>
        
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent dark:from-red-500/20 rounded-bl-full print:hidden"></div>
        
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
        <footer className="text-center mt-16 mb-8 print:mt-8">
        <div className="inline-flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-full shadow-md mb-4 border-2 border-sky-100 dark:border-slate-700 print:hidden">
        <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
        <Plane className="h-6 w-6 rotate-45" />
        </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300">
        Itinerary created with Travel-Rizz on {new Date().toLocaleDateString()}
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
        For updates or changes to your itinerary, visit travel-rizz.com
        </p>
        
        <div className="mt-6 flex justify-center space-x-4 print:hidden">
        <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="border-sky-200 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
        >
        <Printer className="h-4 w-4 mr-2 text-sky-600 dark:text-sky-400" />
        Print
        </Button>
        <Button
        variant="default"
        size="sm"
        onClick={handleExportPDF}
        className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white"
        >
        <Download className="h-4 w-4 mr-2" />
        Export PDF
        </Button>
        </div>
        </footer>
        </div>
        </div>
    )
}
