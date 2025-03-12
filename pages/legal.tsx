"use client"

import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"
import Terms from "@/components/landing/terms"
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

export default function TermsPage() {
  // Use our browser preferences detection hook
  useDetectBrowserPreferences();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="flex flex-col">
        <Terms />
        <Footer />
      </main>
    </div>
  )
}
