import Terms from '../components/landing/terms'
import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';


export default function TermsPage() {
    useDetectBrowserPreferences();
    return (
        <>
        <Head>
            {/* Allow indexing */}
            <meta name="robots" content="index, follow" />
            
            {/* Canonical URL */}
            <link rel="canonical" href="https://travelrizz.app/terms" />
            
            {/* Meta description for SEO */}
            <meta
            name="description"
            content="Read the Terms of Service for TravelRizz, your go-to travel planning app. Learn about our policies, user responsibilities, and more."
            />
            
            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content="Terms of Service - TravelRizz" />
            <meta
            property="og:description"
            content="Read the Terms of Service for TravelRizz, your go-to travel planning app."
            />
            <meta property="og:url" content="https://travelrizz.app/terms" />
            <meta property="og:type" content="website" />
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="Terms of Service - TravelRizz" />
            <meta
            name="twitter:description"
            content="Read the Terms of Service for TravelRizz, your go-to travel planning app."
            />
        </Head>
        <Header />
        <main className="flex flex-col">
        <Terms />
        </main>
        <Footer />
        </>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                landing: (await import(`../public/locales/${locale}/landing.json`)).default,
                terms: (await import(`../public/locales/${locale}/terms.json`)).default
            },
            locale,
            timeZone: 'Asia/Singapore'
        }
    }
}
