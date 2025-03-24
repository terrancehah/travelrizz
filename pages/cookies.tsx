import Cookies from '../components/landing/cookies';
import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'
import Head from 'next/head';

export default function CookiesPage() {
  useDetectBrowserPreferences();
  return (
    <>
      <Head>
        {/* Allow indexing */}
        <meta name="robots" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://travelrizz.app/cookies" />
        
        {/* Meta description for SEO */}
        <meta
          name="description"
          content="Read our Cookie Policy to understand how we use cookies and how you can manage them."
        />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content="Cookie Policy - TravelRizz" />
        <meta
          property="og:description"
          content="Read our Cookie Policy to understand how we use cookies and how you can manage them."
        />
        <meta property="og:url" content="https://travelrizz.app/cookies" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Cookie Policy - TravelRizz" />
        <meta
          name="twitter:description"
          content="Read our Cookie Policy to understand how we use cookies and how you can manage them."
        />
      </Head>
      <Header />
      <main className="flex flex-col">
        <Cookies />
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
              cookies: (await import(`../public/locales/${locale}/cookies.json`)).default
          },
          locale,
          timeZone: 'Asia/Singapore'
      }
  }
}
