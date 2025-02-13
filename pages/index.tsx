"use client"

import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import About from "@/components/landing/about"
import Features from "@/components/landing/features"
import Pricing from '@/components/landing/pricing'
import Footer from "@/components/landing/footer"
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['landing'])),
    },
  };
};

export default function LandingPage() {
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
