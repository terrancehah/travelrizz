"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Steps } from "../components/ui/steps"
// import { useRouter } from "next/navigation"
import { MapPin, Calendar, Heart, Wallet, Languages, Trees, Soup, ShoppingBag, Ship, Palette, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker as CalendarComponent, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { Calendar as CalendarComponent } from "../components/ui/calendar"
import Image from "next/image"
import Head from "next/head"
import { TravelPreference, TravelSession, SupportedLanguage, BudgetLevel } from '../managers/types'
import { initializeSession, generateSessionId, safeStorageOp, getStoredSession, clearSession, SESSION_CONFIG } from '../managers/session-manager'
import LoadingSpinner from '../components/LoadingSpinner'
import Link from "next/link"
import { useLocalizedFont } from "@/hooks/useLocalizedFont"
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTheme } from 'next-themes';
import { useRouter } from "next/router";
import { cn } from '@/utils/cn';
import { savedPlacesManager } from '../managers/saved-places-manager';


// Add Google Maps types
declare global {
    interface Window {
        google: typeof google;
        initAutocomplete?: () => void;
    }
}

type FormData = {
    destination: string
    startDate: string
    endDate: string
    preferences: TravelPreference[]
    budget: BudgetLevel
}

export default function TravelFormPage() {
    const t = useTranslations('travelForm')
    const fonts = useLocalizedFont();
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [selected, setSelected] = useState<DateRange | undefined>();
    const [numberOfMonths, setNumberOfMonths] = useState(1);
    
    // Set initial number of months
    useEffect(() => {
        setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1);
    }, []);
    
    const [formData, setFormData] = useState<FormData>({
        destination: "",
        startDate: "",
        endDate: "",
        preferences: [],
        budget: "" as BudgetLevel // Empty string will not match any enum value
    })
    
    const destinationRef = useRef<HTMLInputElement>(null)
    const budgetRef = useRef<HTMLSelectElement>(null)
    
    // Function to fetch Maps API key
    const fetchMapsApiKey = async () => {
        try {
            const response = await fetch('/api/maps-key');
            const data = await response.json();
            return data.key;
        } catch (error) {
            console.error('Failed to fetch Maps API key:', error);
            return null;
        }
    };
    
    // Define steps configuration
    const steps = [
        {
            number: 1,
            title: t('steps.destination'),
            icon: MapPin
        },
        {
            number: 2,
            title: t('steps.dates'),
            icon: Calendar
        },
        {
            number: 3,
            title: t('steps.preferences'),
            icon: Heart
        },
        {
            number: 4,
            title: t('steps.budget'),
            icon: Wallet
        }
    ]
    
    useEffect(() => {
        // Only load script and initialize autocomplete when on step 1
        if (currentStep === 1) {
            const loadMapsScript = async () => {
                const apiKey = await fetchMapsApiKey();
                if (!apiKey) {
                    console.error('Failed to load Maps API key');
                    return;
                }
                
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                script.async = true;
                script.defer = true;
                
                // Initialize autocomplete after script loads
                script.addEventListener('load', () => {
                    if (destinationRef.current) {
                        const autocomplete = new window.google.maps.places.Autocomplete(destinationRef.current, {
                            types: ["(cities)"]
                        });
                        
                        autocomplete.addListener("place_changed", () => {
                            const place = autocomplete.getPlace();
                            const destination = place.formatted_address || "";
                            if (destinationRef.current) {
                                destinationRef.current.value = destination;
                                setFormData((prev: FormData) => ({
                                    ...prev,
                                    destination
                                }));
                            }
                        });
                    }
                });
                
                document.head.appendChild(script);
                return () => {
                    document.head.removeChild(script);
                };
            };
            
            loadMapsScript();
        }
    }, [currentStep])
    
    useEffect(() => {
        const handleResize = () => {
            setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        if (currentStep === 1 && window.google?.maps?.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(destinationRef.current!, {
                types: ["(cities)"]
            })
            
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace()
                const destination = place.formatted_address || ""
                if (destinationRef.current) {
                    destinationRef.current.value = destination
                    setFormData((prev: FormData) => ({
                        ...prev,
                        destination
                    }))
                }
            })
            
            return () => {
                // Clean up the autocomplete instance when step changes or component unmounts
                autocomplete.unbindAll()
            }
        }
    }, [currentStep])
    
    const handlePreferenceToggle = (preference: TravelPreference) => {
        setFormData((prev) => {
            const preferences = prev.preferences.includes(preference)
            ? prev.preferences.filter((p) => p !== preference)
            : [...prev.preferences, preference]
            return { ...prev, preferences }
        })
    }
    
    const handleSubmit = async () => {
        setLoading(true)
        
        // Clear any existing session before creating a new one
        clearSession();
        
        // Get form values
        const city = formData.destination
        const formattedStartDate = formData.startDate
        const formattedEndDate = formData.endDate
        const preferences = formData.preferences
        const budget = formData.budget
        
        console.log('Form Values:', {
            city,
            formattedStartDate,
            formattedEndDate,
            preferences,
            budget
        })
        
        if (!city || !formattedStartDate || !formattedEndDate || preferences.length === 0 || !budget) {
            alert('Please fill in all required fields and select at least one travel preference')
            setLoading(false)
            return
        }
        
        try {
            const now = Date.now()
            const sessionId = generateSessionId()
            
            // Create new session with form values
            const session: TravelSession = {
                // Session info
                sessionId,
                startTime: now,
                lastActive: now,
                expiresAt: now + SESSION_CONFIG.ABSOLUTE_TIMEOUT,
                
                // Travel details
                destination: city,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                preferences: preferences,
                budget: budget,
                language: router.locale === 'en' ? SupportedLanguage.English :
                router.locale === 'ms' ? SupportedLanguage.Malay :
                router.locale === 'es' ? SupportedLanguage.Spanish :
                router.locale === 'fr' ? SupportedLanguage.French :
                router.locale === 'de' ? SupportedLanguage.German :
                router.locale === 'it' ? SupportedLanguage.Italian :
                router.locale === 'cs' ? SupportedLanguage.Czech :
                router.locale === 'zh-CN' ? SupportedLanguage.SimplifiedChinese :
                router.locale === 'zh-TW' ? SupportedLanguage.TraditionalChinese :
                router.locale === 'ja' ? SupportedLanguage.Japanese :
                router.locale === 'ko' ? SupportedLanguage.Korean :
                SupportedLanguage.English, // Fallback to English if locale not supported
                transport: [],
                
                // Places
                savedPlaces: [],
                currentStage: 1,
                
                // Metrics
                totalPrompts: 0,
                stagePrompts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                savedPlacesCount: 0,
                
                // Payment
                isPaid: false,
                paymentReference: `session_${sessionId}`
            }
            
            // Use session manager's safe storage methods with verification
            console.log('About to store session:', session)
            const storageSuccess = safeStorageOp(() => {
                // Remove old session first
                window.sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
                
                // Set new session
                window.sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session))
                // Verify write by reading back immediately
                const written = window.sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY)
                const parsed = written ? JSON.parse(written) as TravelSession : null
                console.log('Immediate read-back of session:', parsed)
                if (!parsed || !parsed.destination) {
                    console.error('Session write verification failed. Written:', written, 'Parsed:', parsed)
                    throw new Error('Session write verification failed')
                }
                return true
            }, false)
            
            if (!storageSuccess) {
                console.error('Storage operation failed')
                throw new Error('Failed to save session data')
            }
            
            // Verify using session manager's methods
            const savedSession = getStoredSession()
            console.log('Final session verification:', savedSession)
            if (!savedSession) {
                console.error('Failed to save session')
                throw new Error('Failed to save session')
            }
            
            if (!savedSession.destination || !savedSession.startDate || !savedSession.endDate || 
                !savedSession.preferences || !savedSession.preferences.length || 
                !savedSession.sessionId || !savedSession.startTime || 
                !savedSession.lastActive || !savedSession.expiresAt) {
                    console.error('Incomplete session:', savedSession)
                    throw new Error('Session data incomplete')
                }
                
                if (savedSession) {
                    // Redirect to chat with locale
                    const locale = router.locale || 'en'
                    router.push(`/${locale}/chat?session=${session.sessionId}`)
                } else {
                    throw new Error('Session verification failed')
                }
            } catch (error) {
                console.error('Error:', error)
                alert('An error occurred while processing your request. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        
        const goToNextStep = () => {
            if (currentStep === 1) {
                // Save destination and clear input
                if (destinationRef.current) {
                    destinationRef.current.value = ""
                }
            }
            setCurrentStep(prev => prev + 1)
        }
        
        const goToPrevStep = () => {
            // Clear state based on current step
            switch (currentStep) {
                case 2:
                // Clear date selection
                setSelected(undefined);
                setFormData(prev => ({ ...prev, startDate: "", endDate: "" }));
                break;
                case 3:
                // Clear preferences
                setFormData(prev => ({ ...prev, preferences: [] }));
                break;
                case 4:
                // Clear budget
                setFormData(prev => ({ ...prev, budget: "" as BudgetLevel }));
                break;
            }
            setCurrentStep(prev => prev - 1);
        }
        
        const renderStepContent = () => {
            switch (currentStep) {
                case 1:
                return (
                    <div className="w-fit md:w-1/2 2xl:w-1/3 mx-auto space-y-8">
                    {/* Prompt and Input */}
                    <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.destination')}</Label>
                    <Input
                    ref={destinationRef}
                    id="destination"
                    placeholder={t('placeholders.city')}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, destination: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-base
                rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${fonts.text}`}
                        />
                        {/* Navigation */}
                        <div className="flex space-x-4 justify-around">
                        <Button
                        className={`w-full text-base ${fonts.text}`}
                        onClick={goToNextStep}
                        disabled={!formData.destination}
                        >
                        {t('navigation.next')}
                        </Button>
                        </div>
                        </div>
                    )
                    case 2:
                    return (
                        <div className="w-fit mx-auto space-y-8">
                        {/* Prompt and Input */}
                        <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.dates')}</Label>
                        {/* Calendar */}
                        <div className="flex flex-col w-fit space-y-4 p-4 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-md [&_.rdp]:dark:[--rdp-accent-color:rgb(56,189,248)] [&_.rdp]:dark:[--rdp-background-color:rgb(31,41,55)] [&_.rdp]:dark:[--rdp-accent-background-color:rgba(56,189,248,0.2)]">
                        {/* Date display box */}
                        <div className={`p-3 w-full bg-gray-100 dark:bg-gray-700 rounded-lg text-center ${fonts.text} text-gray-700 dark:text-gray-200`}>
                        {formData.startDate && formData.endDate ? (
                            <>
                            <span>{formData.startDate}</span>
                            <span className="mx-2">→</span>
                            <span>{formData.endDate}</span>
                            </>
                        ) : (
                            <span>{t('prompts.dateselection')}</span>
                        )}
                        </div>
                        {/* Calendar Component */}
                        <CalendarComponent
                        style={{
                            '--rdp-accent-color': 'rgb(125 211 252)', // sky-400 for light mode
                            '--rdp-background-color': 'white',
                            '--rdp-accent-background-color': 'rgba(125, 211, 252, 0.2)',
                            '--rdp-day_button-border-radius': '6px',
                            '--rdp-selected-border': 'none',
                            '--rdp-today-color': 'rgb(56 189 248)', // sky-blue for light mode
                            '--rdp-range_start-date-background-color': 'rgb(74 136 198)', // sky-blue
                            '--rdp-range_end-date-background-color': 'rgb(74 136 198)', // sky-blue
                            '--rdp-disabled-opacity': '0.15'
                        } as React.CSSProperties}
                        mode="range" 
                        min={1}
                        max={5}
                        numberOfMonths={numberOfMonths}
                        disabled={(date) => {
                            const today = new Date(new Date().setHours(0,0,0,0));
                            // Always disable past dates
                            if (date < today) return true;
                            
                            // If we have a start date selected but no end date yet
                            if (selected?.from && !selected.to) {
                                const startDate = new Date(selected.from);
                                const maxDate = new Date(startDate);
                                maxDate.setDate(startDate.getDate() + 4);
                                
                                // During end date selection, disable dates out of range
                                return date < startDate || date > maxDate;
                            }
                            
                            // If both dates are selected or no dates selected, only disable past dates
                            return false;
                        }}
                        selected={selected}
                        defaultMonth={new Date()}
                        fromDate={new Date()}
                        onSelect={(range: DateRange | undefined) => {
                            setSelected(range);
                            // TypeScript type guard to ensure dates are defined
                            if (range && 'from' in range && 'to' in range && range.from && range.to) {
                                const formatDate = (date: Date) => {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                };
                                
                                setFormData(prev => ({
                                    ...prev,
                                    startDate: formatDate(range.from as Date),
                                    endDate: formatDate(range.to as Date)
                                }));
                            }
                        }}
                        className={`${fonts.text} w-min lg:w-fit`}
                        classNames={{
                            caption_label: "pl-3 my-auto",
                            nav_button: cn(
                                "bg-transparent opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-300"
                            ),
                            head_cell: "text-gray-500 dark:text-gray-400",
                            cell: "[&:has([aria-selected])]:bg-sky-50 dark:[&:has([aria-selected])]:bg-sky-900/20 [&:has([aria-selected])]:rounded-md",
                            day: "aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300 rounded-md",
                            day_selected: "bg-sky-400/10 text-sky-600 hover:bg-sky-500/20 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 dark:bg-sky-500/10 dark:hover:bg-sky-500/20",
                        }}
                        components={{
                            PreviousMonthButton: (props) => (
                                <button {...props} className={cn(props.className)}>
                                <ChevronLeft className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" />
                                </button>
                            ),
                            NextMonthButton: (props) => (
                                <button {...props} className={cn(props.className)}>
                                <ChevronRight className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" />
                                </button>
                            )
                        }}
                        />
                        </div>
                        {/* Navigation */}
                        <div className="flex space-x-4 justify-around">
                        <Button variant="outline" className={`w-full transition-colors duration-300 text-base 
                border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 
                ${fonts.text}`} onClick={goToPrevStep}>
                            {t('navigation.back')}
                            </Button>
                            <Button
                            className={`w-full transition-colors duration-300 text-base ${fonts.text}`}
                            onClick={goToNextStep}
                            disabled={!formData.startDate || !formData.endDate}
                            >
                            {t('navigation.next')}
                            </Button>
                            </div>
                            </div>
                        )
                        case 3:
                        return (
                            <div className="w-fit md:w-1/2 2xl:w-1/3 mx-auto space-y-8">
                            {/* Prompts and Input */}
                            <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.preferences')}</Label>
                            <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: "culture", label: t('interests.culture'), icon: Languages },
                                { value: "nature", label: t('interests.nature'), icon: Trees },
                                { value: "food", label: t('interests.foodie'), icon: Soup },
                                { value: "leisure", label: t('interests.leisure'), icon: ShoppingBag },
                                { value: "adventure", label: t('interests.adventure'), icon: Ship },
                                { value: "arts", label: t('interests.arts'), icon: Palette }
                            ].map(({ value, label, icon: Icon }) => (
                                <Button
                                key={value}
                                variant={formData.preferences.includes(value as TravelPreference) ? "default" : "outline"}
                                className={`flex items-center justify-start space-x-2 transition-all duration-300 text-base 
                      hover:scale-[1.02] active:scale-[0.98] ${fonts.text} ${
                                    formData.preferences.includes(value as TravelPreference) 
                                    ? 'shadow-md hover:shadow-lg' 
                                    : 'hover:border-sky-400 dark:hover:border-sky-400'
                                    }`}
                                    onClick={() => handlePreferenceToggle(value as TravelPreference)}
                                    >
                                    <span>{label}</span>
                                    <Icon className="h-4 w-4" />
                                    </Button>
                                ))}
                                </div>
                                {/* Navigation */}
                                <div className="flex space-x-4">
                                <Button variant="outline" className={`w-full transition-colors duration-300 text-base 
                border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 
                ${fonts.text}`} onClick={goToPrevStep}>
                                    {t('navigation.back')}
                                    </Button>
                                    <Button
                                    className={`w-full transition-colors duration-300 text-base ${fonts.text}`}
                                    onClick={goToNextStep}
                                    disabled={formData.preferences.length === 0}
                                    >
                                    {t('navigation.next')}
                                    </Button>
                                    </div>
                                    </div>
                                )
                                case 4:
                                return (
                                    <div className="w-fit md:w-1/2 2xl:w-1/3 mx-auto space-y-8">
                                    {/* Prompts and Inputs */}
                                    <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.budget')}</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: BudgetLevel.Budget, label: t('budgetOptions.budget') },
                                        { value: BudgetLevel.Moderate, label: t('budgetOptions.moderate') },
                                        { value: BudgetLevel.Luxury, label: t('budgetOptions.luxury') },
                                        { value: BudgetLevel.UltraLuxury, label: t('budgetOptions.ultraLuxury') }
                                    ].map(({ value, label }) => (
                                        <Button
                                        key={value}
                                        variant={formData.budget === value ? "default" : "outline"}
                                        className={`p-4 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${fonts.text} ${
                                            formData.budget === value 
                                            ? 'shadow-md hover:shadow-lg'
                                            : 'hover:border-sky-400 dark:hover:border-sky-400'
                                            }`}
                                            onClick={() => setFormData((prev) => ({ ...prev, budget: value }))}
                                            >
                                            <span>{label}</span>
                                            </Button>
                                        ))}
                                        </div>
                                        {/* Navigation */}
                                        <div className="flex space-x-4">
                                        <Button variant="outline" className={`w-full transition-colors duration-300 text-base 
                border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 
                ${fonts.text}`} onClick={goToPrevStep}>
                                            {t('navigation.back')}
                                            </Button>
                                            <Button
                                            className={`w-full transition-colors duration-300 text-base ${fonts.text}`}
                                            onClick={handleSubmit}
                                            disabled={loading || !formData.budget}
                                            >
                                            {loading ? <LoadingSpinner /> : t('navigation.startPlanning')}
                                            </Button>
                                            </div>
                                            </div>
                                        )
                                        default:
                                        return null
                                    }
                                }
                                
                                return (
                                    <div className="md:min-h-screen bg-white dark:bg-gray-900 transition-colors duration-400">
                                    <main className="flex min-h-[100dvh] w-full">
                                    <div className="fixed flex flex-wrap flex-row top-0 left-0 right-0 z-10 md:relative md:w-64 bg-light-blue dark:bg-primary shadow-md 
          md:space-y-14 gap-y-2 p-3 md:p-6 border-r dark:border-gray-800 md:flex-col items-center md:items-start justify-between">
                                    
                                    {/* Logo and Brand Name */}
                                    <Link href="/" className="flex gap-x-1 pr-4 w-auto order-1">
                                    <Image
                                    src="/images/travel-rizz.png"
                                    alt="Travel-Rizz Logo"
                                    width={40}
                                    height={40}
                                    className="h-12 w-12 object-contain dark:invert dark:brightness-0 dark:contrast-200"
                                    />
                                    <span className={`font-caveat text-3xl h-min my-auto text-primary dark:text-white ${fonts.heading}`}>Travel-Rizz</span>
                                    </Link>
                                    
                                    {/* Steps */}
                                    <div className="order-2 mx-auto md:mx-0 font-raleway">
                                    <Steps currentStep={currentStep} steps={steps} />
                                    </div>
                                    
                                    {/* Theme and Language Switchers */}
                                    <div className="my-0 flex items-center md:gap-x-2 gap-x-1 w-auto order-1 md:order-3 flex-wrap flex-row">
                                    <div className="flex items-center justify-center bg-sky-300/80 dark:bg-blue-700 rounded-md p-2 order-2 md:order-1">
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
                                    <div className="flex items-center justify-center rounded-md p-2 order-1 md:order-2">
                                    <LanguageSwitcher />
                                    </div>
                                    </div>
                                    </div>
                                    
                                    {/* Main Content */}
                                    <div className="flex flex-1 p-6 md:mt-0">
                                    <div className="w-full m-auto">
                                    {renderStepContent()}
                                    </div>
                                    </div>
                                    </main>
                                    </div>
                                )
                            }
                            
                            export async function getStaticProps({ locale }: { locale: string }) {
                                return {
                                    props: {
                                        messages: {
                                            travelForm: (await import(`../public/locales/${locale}/travel-form.json`)).default
                                        },
                                        locale,
                                        timeZone: 'Asia/Singapore'
                                    }
                                }
                            }
