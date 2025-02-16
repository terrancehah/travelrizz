"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Steps } from "../components/ui/steps"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Heart, Wallet, Languages, Trees, Soup, ShoppingBag, Ship, Palette, Sun, Moon } from "lucide-react"
import flatpickr from "flatpickr"
import type { Instance } from "flatpickr/dist/types/instance"
import "flatpickr/dist/flatpickr.min.css"
import Image from "next/image"
import Head from "next/head"
import { TravelPreference, TravelSession, SupportedLanguage } from '../managers/types'
import { initializeSession, generateSessionId, safeStorageOp, getStoredSession, SESSION_CONFIG } from '../utils/session-manager'
import LoadingSpinner from '../components/LoadingSpinner'
import Link from "next/link"
import { useLocalizedFont } from "@/hooks/useLocalizedFont"
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTheme } from 'next-themes';

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
  budget: string
}

export default function TravelFormPage() {
  const t = useTranslations('travelForm')
  const fonts = useLocalizedFont();
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    destination: "",
    startDate: "",
    endDate: "",
    preferences: [],
    budget: ""
  })

  const destinationRef = useRef<HTMLInputElement>(null)
  const dateRangeRef = useRef<HTMLInputElement>(null)
  const budgetRef = useRef<HTMLSelectElement>(null)

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
    // Initialize Google Places Autocomplete
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initAutocomplete`
    script.async = true
    script.defer = true

    window.initAutocomplete = () => {
      if (destinationRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(destinationRef.current, {
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
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
      if (window.initAutocomplete) {
        delete window.initAutocomplete
      }
    }
  }, [])

  useEffect(() => {
    if (currentStep === 2 && dateRangeRef.current) {
      // Cleanup any existing flatpickr instance
      const existingInstance = (dateRangeRef.current as any)._flatpickr
      if (existingInstance) {
        existingInstance.destroy()
      }

      // Initialize new flatpickr instance
      const fp = flatpickr(dateRangeRef.current, {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: (selectedDates, dateStr, instance) => {
          try {
            // When user starts a new selection, reset maxDate
            if (selectedDates.length === 0) {
              instance.set("maxDate", null);
              console.log('Reset date constraints for new selection');
              return;
            }

            // When first date is selected, set maxDate to 5 days ahead
            if (selectedDates.length === 1) {
              const maxDate = new Date(selectedDates[0].getTime() + (4 * 24 * 60 * 60 * 1000));
              instance.set("maxDate", maxDate);
              console.log('Set max date to:', maxDate.toISOString());
              return;
            }
            
            // When both dates are selected
            if (selectedDates.length === 2) {
              const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              const startDate = formatDate(selectedDates[0]);
              const endDate = formatDate(selectedDates[1]);
              
              // Validate date range
              const diffDays = Math.ceil(
                (selectedDates[1].getTime() - selectedDates[0].getTime()) / 
                (1000 * 60 * 60 * 24)
              ) + 1;
              
              if (diffDays > 5) {
                console.warn('Invalid date range selected:', diffDays, 'days');
                return;
              }
              
              console.log('Selected dates:', { startDate, endDate, diffDays });
              setFormData(prev => ({
                ...prev,
                startDate,
                endDate
              }));

              // Reset maxDate after successful selection to allow reselection
              instance.set("maxDate", null);
            }
          } catch (error) {
            console.error('Error handling date selection:', error);
            // Reset the date picker on error
            instance.clear();
            instance.set("maxDate", null);
          }
        }
      })

      // Cleanup on unmount
      return () => {
        fp.destroy()
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

    if (!city || !formattedStartDate || !formattedEndDate || preferences.length === 0) {
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
        budget: budget || '',
        language: SupportedLanguage.English, // Direct enum usage
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

      // Use direct navigation with reload to ensure clean state
      window.location.href = `/chat?session=${session.sessionId}`
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
    if (currentStep === 2) {
      // Clear date range input when going back
      if (dateRangeRef.current) {
        dateRangeRef.current.value = ""
      }
    }
    setCurrentStep(prev => prev - 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.destination')}</Label>
              <Input
                ref={destinationRef}
                id="destination"
                placeholder={t('placeholders.city')}
                onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-base
                rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${fonts.text}`}
              />
            </div>
            <div className="flex space-x-4">
              <Button
                className="w-full text-base"
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
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.dates')}</Label>
              <Input
                ref={dateRangeRef}
                id="date-range"
                placeholder={t('placeholders.dateRange')}
                readOnly
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-base
                rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${fonts.text}`}
              />
            </div>
            <div className="flex space-x-4">
              <Button variant="default" className="w-full transition-colors duration-300" onClick={goToPrevStep}>
                {t('navigation.back')}
              </Button>
              <Button
                className="w-full transition-colors duration-300 text-base"
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
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.preferences')}</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "Culture and Heritage", label: t('interests.culture'), icon: Languages },
                  { value: "Nature", label: t('interests.nature'), icon: Trees },
                  { value: "Foodie", label: t('interests.foodie'), icon: Soup },
                  { value: "Leisure", label: t('interests.leisure'), icon: ShoppingBag },
                  { value: "Adventure", label: t('interests.adventure'), icon: Ship },
                  { value: "Arts & Museum", label: t('interests.arts'), icon: Palette }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={formData.preferences.includes(value as TravelPreference) ? "default" : "outline"}
                    className={`flex items-center justify-start space-x-2 transition-colors duration-300 text-base ${fonts.text}`}
                    onClick={() => handlePreferenceToggle(value as TravelPreference)}
                  >
                    <span>{label}</span>
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" className="w-full transition-colors duration-300 text-base" onClick={goToPrevStep}>
                {t('navigation.back')}
              </Button>
              <Button
                className="w-full transition-colors duration-300 text-base"
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
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className={`text-lg lg:text-2xl ${fonts.text}`}>{t('prompts.budget')}</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "Budget", label: t('budgetOptions.budget') },
                  { value: "Moderate", label: t('budgetOptions.moderate') },
                  { value: "Luxury", label: t('budgetOptions.luxury') },
                  { value: "Ultra Luxury", label: t('budgetOptions.ultraLuxury') }
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={formData.budget === value ? "default" : "outline"}
                    className={`p-4 ${fonts.text}`}
                    onClick={() => setFormData((prev) => ({ ...prev, budget: value }))}
                  >
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" className="w-full transition-colors duration-300 text-base" onClick={goToPrevStep}>
                {t('navigation.back')}
              </Button>
              <Button
                className="w-full transition-colors duration-300 text-base"
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
          <div className="order-2 mx-auto md:mx-0">
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
        <div className="flex flex-1 p-6 mt-32 md:mt-0">
          <div className="max-w-md w-full m-auto space-y-8">
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