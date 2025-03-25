import Privacy from "../components/landing/privacy"
import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';

export default function PrivacyPage() {
  useDetectBrowserPreferences();
  return (
    <>
    <Head>
        {/* Allow indexing */}
        <meta name="robots" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://travelrizz.app/privacy" />
        
        {/* Meta description for SEO */}
        <meta
        name="description"
        content="Read the Privacy Policy for TravelRizz, your go-to travel planning app. 
        Learn about how we collect and use your data, and your rights under our privacy policy."
        />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content="Privacy Policy - TravelRizz" />
        <meta
        property="og:description"
        content="Read the Privacy Policy for TravelRizz, your go-to travel planning app."
        />
        <meta property="og:url" content="https://travelrizz.app/privacy" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - TravelRizz" />
        <meta
        name="twitter:description"
        content="Read the Privacy Policy for TravelRizz, your go-to travel planning app."
        />
    </Head>
    <Header />
    <main className="flex flex-col">
    <Privacy />
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
              privacy: (await import(`../public/locales/${locale}/privacy.json`)).default
          },
          locale,
          timeZone: 'Asia/Singapore'
      }
  }
}