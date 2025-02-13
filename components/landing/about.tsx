import { useTranslation } from 'next-i18next';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';

export default function About() {
  const { t } = useTranslation('landing');
  const fonts = useLocalizedFont();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
      <div className="container w-[80%] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-8">
            <h2 className={`text-3xl tracking-tighter text-primary dark:text-sky-100 sm:text-4xl md:text-5xl ${fonts.heading} transition-colors duration-400`}>
              {t('about.title')}
            </h2>
            <p className={`text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-400`}>
              {t('about.intro')}
            </p>
            <p className={`text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-200`}>
              {t('about.experience')}
            </p>
            <p className={`text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-200`}>
              {t('about.mission')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
