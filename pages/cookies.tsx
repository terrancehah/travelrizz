"use client"

import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/landing/header';
import Footer from '../components/landing/footer';
import Cookies from '../components/landing/cookies';
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

const CookiesPage: NextPage = () => {
  // Use our browser preferences detection hook
  useDetectBrowserPreferences();
  return (
    <>
      <Head>
        <title>Cookie Policy - TravelRizz</title>
        <meta 
          name="description" 
          content="Learn about how TravelRizz.app uses cookies through our third-party providers to enhance your experience and ensure security." 
        />
      </Head>
      <Header />
      <main>
        <Cookies />
      </main>
      <Footer />
    </>
  );
};

export default CookiesPage;
