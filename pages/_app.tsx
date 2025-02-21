import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { IntlProvider } from 'next-intl'
import { Noto_Sans_SC, Raleway, Caveat, Lato } from '@next/font/google'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import 'flatpickr/dist/flatpickr.css'
import Head from 'next/head'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-raleway',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-caveat',
  display: 'swap',
  preload: true,
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export default function App({ Component, pageProps: { messages, locale, timeZone, ...pageProps } }: AppProps) {
  return (
    <IntlProvider 
      messages={messages} 
      locale={locale ?? 'en'} 
      timeZone={timeZone ?? 'Asia/Singapore'}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <Head>
          <title>Travel-Rizz - Plan Your Dream Trip Effortlessly</title>
          <meta name="description" content="Plan your perfect journey with Travel-Rizz, combining human expertise with AI assistance to create personalized trips." />
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        </Head>
        <div className={`${notoSansSC.variable} ${raleway.variable} ${caveat.variable} ${lato.variable}`}>
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </IntlProvider>
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