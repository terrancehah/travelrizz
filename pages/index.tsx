"use client"

import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
import Features from "@/components/landing/features"
import Pricing from '@/components/landing/pricing'
import Footer from "@/components/landing/footer"
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

export default function LandingPage() {
  // Use our browser preferences detection hook
  useDetectBrowserPreferences();

  return (
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
  )
}
