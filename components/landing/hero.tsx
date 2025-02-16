import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useLocalizedFont } from "../../hooks/useLocalizedFont";

export default function Hero() {
  const t = useTranslations('landing');
  const { locale } = useRouter();  
  const fonts = useLocalizedFont();

  console.log('Current locale:', locale); 

  return (  
    <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center bg-white dark:bg-gray-900 transition-colors duration-400">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: 'url("/images/kalbarri-beach.jpeg")',
          opacity: 0.3
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col w-[80%] mx-auto items-center text-center">
        <div className="space-y-6">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-semi-bold tracking-normal text-primary dark:text-sky-100 ${fonts.heading}`}>
            {t('hero.title')}
          </h1>
          <p className={`mx-auto max-w-3xl text-gray-600 dark:text-gray-200 text-lg md:text-xl/relaxed font-normal ${fonts.text}`}>
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="space-x-4 mt-8">
          <Button asChild size="lg" className={`bg-sky-blue hover:bg-sky-600 text-white text-base dark:bg-sky-500 dark:hover:bg-sky-400 ${fonts.text}`}>
            <Link href="/travel-form">{t('hero.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
