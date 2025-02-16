import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';

export default function Pricing() {
  const t = useTranslations('landing');
  const fonts = useLocalizedFont();

  return (
    <section id="pricing" className="w-full py-16 bg-white dark:bg-gray-900">
      <div className="container w-[80%] mx-auto">
        <h2 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 text-center mb-6 ${fonts.heading}`}>
          {t('pricing.title')}
        </h2>
        
        <p className={`text-lg text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto ${fonts.text}`}>
          {t('pricing.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Current Pricing */}
          <div className="p-8 rounded-xl border-2 border-primary dark:border-sky-400 bg-white dark:bg-gray-800/85 transition-colors duration-400 space-y-6">
            <h3 className={`text-3xl font-bold mb-4 dark:text-white ${fonts.heading}`}>{t('pricing.oneTime.title')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-x-3">
                <span className="text-2xl font-raleway text-primary dark:text-white">{t('pricing.oneTime.price')}</span>
                <span className="text-2xl font-raleway text-gray-400 line-through">{t('pricing.oneTime.originalPrice')}</span>
              </div>
              <div>
                <span className="inline-block bg-blue-200 dark:bg-sky-500 text-blue-500 dark:text-sky-100 text-base font-medium px-2.5 py-1 rounded font-raleway">{t('pricing.oneTime.tag')}</span>
              </div>
            </div>
            <div className="space-y-4 mb-2">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-base font-raleway">
                {[
                  'Unlimited AI suggestions',
                  'Visualised route optimization',
                  'Local etiquette guidance',
                  'Ad-Free experience'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">✓ {t(`pricing.oneTime.features.${index}`)}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscription Pricing */}
          <div className="p-8 rounded-xl border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-400 opacity-100 relative">
            <Badge variant="outline" className="absolute -top-3 right-4 bg-white dark:bg-gray-800 font-raleway">{t('pricing.subscription.badge')}</Badge>
            <div className="opacity-50">
              <h3 className={`text-3xl font-bold mb-6 dark:text-white ${fonts.heading}`}>{t('pricing.subscription.title')}</h3>
              <div className="space-y-2 mb-6">
                <div>
                  <span className="text-2xl font-raleway text-primary dark:text-white">{t('pricing.subscription.price')}</span>
                </div>
                <div>
                  <span className="inline-block bg-blue-600/50 dark:bg-blue-600 text-blue-700 dark:text-gray-100 text-base font-medium px-2.5 py-1 rounded font-raleway">{t('pricing.subscription.tag')}</span>
                </div>
              </div>
              <div className="space-y-4 mb-2">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-base font-raleway">
                  {[
                    'Everything in One-Time Access',
                    'Priority AI response',
                    'Unlimited trip planning',
                    'Save multiple itineraries'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">✓ {t(`pricing.subscription.features.${index}`)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-x-4 w-full pt-12 items-center flex justify-center">
          <Button asChild size="lg" className="bg-sky-blue hover:bg-sky-600 text-white text-base dark:bg-sky-500 dark:hover:bg-sky-400 font-raleway">
          <Link href="/travel-form">{t('pricing.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
