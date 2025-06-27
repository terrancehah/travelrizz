import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { IntlProvider } from 'next-intl'
import { Noto_Sans_SC, Raleway, Caveat, Lato } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import CookieConsent from 'react-cookie-consent'
import '../styles/globals.css'
import Head from 'next/head'
import Link from 'next/link' // For link to the Cookie Policy page

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

export default function App({ Component, pageProps: { messages, locale, ...pageProps } }: AppProps) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <IntlProvider 
        messages={messages} 
        locale={locale ?? 'en'} 
        timeZone={timeZone ?? 'Asia/Singapore'}
        >
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <Head>
                    <title>Travel-Rizz: Your AI Trip Planner for Perfect Itineraries</title>
                    <meta name="description" content="Create your perfect trip with Travel-Rizz, the AI trip planner that builds personalized itineraries effortlessly. No signup needed—start planning now!" />
                    <meta charSet="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" sizes="any" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
                    <SpeedInsights />
                </Head>
                <div className={`${notoSansSC.variable} ${raleway.variable} ${caveat.variable} ${lato.variable}`}>
                    <Component {...pageProps} />
                    <CookieConsent
                    location="bottom"
                    buttonText="Dismiss"
                    cookieName="travelrizz-consent"
                    style={{
                        background: "#1f2937", // gray-800 for dark theme
                        color: "#f3f4f6", // gray-100
                        fontFamily: "var(--font-raleway)",
                        padding: "1rem",
                        borderTop: "1px solid #374151", // gray-700
                    }}
                    contentStyle={{
                        margin: "1rem", // Adjust padding of the inner container
                        marginTop: "0.5rem",
                        color: "#f3f4f6", // Ensure text color matches the outer container
                    }}
                    buttonStyle={{
                        background: "#3b82f6", // blue-500
                        color: "#ffffff",
                        fontSize: "14px",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        margin: "0 10px",
                    }}
                    expires={30} // Cookie expires after 150 days
                    enableDeclineButton={false} // Allow users to decline cookies
                    onAccept={() => {
                        console.log("User accepted cookies");
                        // Optionally, enable Stripe script loading here if you deferred it
                    }}
                    >
                        We use third-party cookies from Stripe for payment processing.{" "}
                        <Link href="/cookies" title="Cookie Policy" aria-label="Learn more about our cookie policy" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                            Learn more about our cookie policy
                        </Link>
                    </CookieConsent>
                </div>
            </ThemeProvider>
        </IntlProvider>
    )
}