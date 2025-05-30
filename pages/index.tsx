import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
import Articles from "@/components/landing/articles"
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react"

const Features = dynamic(() => import('@/components/landing/features'), { ssr: false });
const Pricing = dynamic(() => import('@/components/landing/pricing'), { ssr: false });

export default function LandingPage() {
    // Use our browser preferences detection hook
    useDetectBrowserPreferences();
    
    return (
        <>
        <Head>
            {/* Page Title */}
            <title>Travel-Rizz: Your Friendly AI Trip Planner for Perfect Itineraries</title>
            
            {/* Allow indexing */}
            <meta name="robots" content="index, follow" />
            
            {/* Keywords */}
            <meta name="keywords" content="travelrizz, travel rizz, travel-rizz, trip planner, AI trip planner, AI travel planner, itinerary builder" />
            
            {/* Canonical URL */}
            <link rel="canonical" href="https://travelrizz.app/" />
            
            {/* Meta description for SEO */}
            <meta
            name="description"
            content="Create your perfect trip with Travel-Rizz, the friendly AI trip planner that builds personalized itineraries effortlessly. No signup needed — start planning now!"
            />
            
            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content="Travel-Rizz: Your Friendly AI Trip Planner for Perfect Itineraries" />
            <meta
            property="og:description"
            content="Create your perfect trip with Travel-Rizz, the friendly AI trip planner that builds personalized itineraries effortlessly. No signup needed — start planning now!"
            />
            <meta property="og:url" content="https://travelrizz.app/" />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="Travel-Rizz: Your Friendly AI Trip Planner for Perfect Itineraries" />
            <meta
            name="twitter:description"
            content="Create your perfect trip with Travel-Rizz, the friendly AI trip planner that builds personalized itineraries effortlessly. No signup needed — start planning now!"
            />
            <meta name="twitter:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />
        </Head>
        <div className="min-h-dvh bg-white dark:bg-gray-900">
        <Header />
        <main className="flex flex-col">
        <Hero />
        <About />
        <Features />
        <Pricing />
        <Articles />
        <Footer />
        </main>
        </div>
        <Analytics />
        </>
    )
}


export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                landing: (await import(`../public/locales/${locale}/landing.json`)).default,
                travelForm: (await import(`../public/locales/${locale}/travel-form.json`)).default,
                travelChat: (await import(`../public/locales/${locale}/travel-chat.json`)).default,
                parameters: (await import(`../public/locales/${locale}/parameters.json`)).default,
                components: (await import(`../public/locales/${locale}/components.json`)).default
            },
            locale,
            timeZone: 'Asia/Singapore'
        }
    }
}
