import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
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
            {/* Allow indexing */}
            <meta name="robots" content="index, follow" />
            
            {/* Canonical URL */}
            <link rel="canonical" href="https://travelrizz.app/" />
            
            {/* Meta description for SEO */}
            <meta
            name="description"
            content="Meet Travel-Rizz - your friendly AI travel planner. No signup required.."
            />
            
            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content="TravelRizz - Your friendly AI travel planner" />
            <meta
            property="og:description"
            content="TravelRizz - Your friendly AI travel planner. No signup required."
            />
            <meta property="og:url" content="https://travelrizz.app/" />
            <meta property="og:type" content="website" />
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="TravelRizz - Your friendly AI travel planner" />
            <meta
            name="twitter:description"
            content="TravelRizz - Your friendly AI travel planner. No signup required."
            />
        </Head>
        <div className="min-h-dvh bg-white dark:bg-gray-900">
        <Header />
        <main className="flex flex-col">
        <Hero />
        <About />
        <Features />
        <Pricing />
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
