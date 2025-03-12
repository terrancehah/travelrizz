import Link from "next/link"
import { Twitter, Facebook, Instagram } from "lucide-react"
import Image from "next/image"
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';

export default function Footer() {
  const t = useTranslations('landing')
  const fonts = useLocalizedFont();

  return (
    <footer className="w-full py-6 bg-gray-50 dark:bg-gray-900 flex items-center border-t border-gray-100 dark:border-gray-800 transition-colors duration-400">
      <div className="container w-[80%] mx-auto flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mx-auto">
          
          <div className="flex flex-col w-[100%] mx-auto space-y-4">
            <Link href="/" className="flex items-center space-x-1">
              <Image
                src="/images/travel-rizz.png"
                alt="Travel-Rizz Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain dark:invert dark:brightness-0 dark:contrast-200"
              />
              <span className={`font-bold font-caveat text-2xl text-primary dark:text-white`}>Travel-Rizz</span>
            </Link>
            <p className={`text-sm text-secondary dark:text-gray-300 font-raleway ${fonts.text}`}>{t('footer.tagline')}</p>
          </div>

          <div className="mt-2 flex flex-col w-[90%] md:w-[60%] mx-auto">
            <h3 className={`font-semibold mb-4 text-primary dark:text-sky-100 font-raleway ${fonts.heading}`}>{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.quickLinks.features')}
                </Link>
              </li>
              <li>
                <Link href="#about" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.quickLinks.about')}
                </Link>
              </li>
              <li>
                <Link href="/travel-form" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.quickLinks.start')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-2 flex flex-col w-[90%] md:w-[60%] mx-auto">
            <h3 className={`font-semibold mb-4 text-primary dark:text-sky-100 font-raleway ${fonts.heading}`}>{t('footer.legal.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={`text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 font-raleway ${fonts.text}`}>
                  {t('footer.legal.cookies')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-2 flex flex-col w-[90%] md:w-[60%] mx-auto">
            <h3 className={`font-semibold mb-4 text-primary dark:text-sky-100 font-raleway ${fonts.heading}`}>{t('footer.connect.title')}</h3>
            <div className="flex space-x-4">
              <Link href="https://x.com/travelrizz" target="_blank" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 ${fonts.text}`}>
                <Twitter className="h-5 w-5" aria-label={t('footer.connect.twitter')} />
              </Link>
              <Link href="https://instagram.com/travelrizz" target="_blank" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 ${fonts.text}`}>
                <Instagram className="h-5 w-5" aria-label={t('footer.connect.instagram')} />
              </Link>
              <Link href="https://facebook.com/travelrizz" target="_blank" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-400 ${fonts.text}`}>
                <Facebook className="h-5 w-5" aria-label={t('footer.connect.facebook')} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col text-center mx-auto items-center w-full">
          <p className={`text-sm text-secondary dark:text-gray-400 w-max text-center ${fonts.text}`}> 2025 Travel-Rizz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
