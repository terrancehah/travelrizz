import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { appWithTranslation } from 'next-i18next';
import { Noto_Sans_SC, Raleway, Caveat, Lato, ZCOOL_KuaiLe } from '@next/font/google'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import 'flatpickr/dist/flatpickr.css'
import Head from 'next/head'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
})

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
})

const zcoolKuaiLe = ZCOOL_KuaiLe({
  subsets: ['latin'],
  variable: '--font-zcool-kuai-le',
  weight: ['400'],
})

function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter()
  const mainFont = locale === 'zh' ? notoSansSC.className : raleway.className

  return (
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
      <div className={`${mainFont} ${notoSansSC.variable} ${raleway.variable} ${caveat.variable} ${lato.variable} ${zcoolKuaiLe.variable}`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}

export default appWithTranslation(App)