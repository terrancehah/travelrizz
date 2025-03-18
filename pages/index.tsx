import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
import Features from "@/components/landing/features"
import Pricing from '@/components/landing/pricing'
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';

export default function LandingPage() {
    // Use our browser preferences detection hook
    useDetectBrowserPreferences();
    
    return (
        <>
        {/* <Head>
            <link
                rel="preload"
                href="/fonts/NotoSansSC-VariableFont_wght.ttf"
                as="font"
                type="font/ttf"
                crossOrigin="anonymous"
                />
            <link
                rel="preload"
                href="/fonts/Raleway-VariableFont_wght.ttf"
                as="font"
                type="font/ttf"
                crossOrigin="anonymous"
                />
            <link
                rel="preload"
                href="/fonts/Caveat-VariableFont_wght.ttf"
                as="font"
                type="font/ttf"
                crossOrigin="anonymous"
                />
        </Head> */}
        <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="flex flex-col">
        <Hero />
        <About />
        <Features />
        <Pricing />
        <Footer />
        </main>
        </div>
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
