import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
import Articles from "@/components/landing/articles"
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react"
import { useRouter } from 'next/router';

const Features = dynamic(() => import('@/components/landing/features'), { ssr: false });
const Pricing = dynamic(() => import('@/components/landing/pricing'), { ssr: false });

export default function LandingPage() {
    // Use our browser preferences detection hook
    useDetectBrowserPreferences();
    const { locale } = useRouter();
    const supportedLocales = ['en', 'fr', 'de', 'es', 'it', 'cs', 'ja', 'ko', 'ms', 'zh-CN', 'zh-TW'];
    
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

            {/* hreflang tags for internationalization */}
            {supportedLocales.map((lang) => {
                const href = `https://travelrizz.app/${lang === 'en' ? '' : lang}`;
                return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
            })}
            <link rel="alternate" hrefLang="x-default" href="https://travelrizz.app/" />
            
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

            {/* Schema.org Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "Travel-Rizz",
                  "url": "https://travelrizz.app/",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://travelrizz.app/travel-form?q=\{search_term_string\}",
                    "query-input": "required name=search_term_string"
                  }
                })
              }}
            />
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
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <a href="/test-itinerary">Test Itinerary</a>
        </div>
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
            },
            locale,
            timeZone: 'Asia/Singapore'
        }
    }
}
