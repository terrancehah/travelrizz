"use client"

import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"
import Privacy from "@/components/landing/privacy"
import { NextPage } from 'next';
import Head from 'next/head';
import { useDetectBrowserPreferences } from '@/hooks/useDetectBrowserPreferences'

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      messages: {
        landing: (await import(`../public/locales/${locale}/landing.json`)).default,
      },
      locale,
      timeZone: 'Asia/Singapore'
    },
  }
}

const PrivacyPage: NextPage = () => {
  // Use our browser preferences detection hook
  useDetectBrowserPreferences();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Privacy Policy | TravelRizz</title>
        <meta 
          name="description" 
          content="TravelRizz Privacy Policy - Learn how we protect your privacy and handle your data." 
        />
      </Head>
      <Header />
      <main className="flex flex-col">
        <Privacy />
        <Footer />
      </main>
    </div>
  )
}

export default PrivacyPage;
