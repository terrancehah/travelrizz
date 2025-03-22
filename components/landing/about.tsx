import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import React from 'react';

export default function About() {
  const t = useTranslations('landing');
  const fonts = useLocalizedFont();

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
      <div className="container w-[80%] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-8">
            <h2 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} transition-colors duration-400`}>
              {t('about.title').split('Travel-Rizz').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && <span className="font-caveat">Travel-Rizz</span>}
                </React.Fragment>
              ))}
            </h2>
            <p className={`text-gray-600 dark:text-gray-300 font-normal text-lg/relaxed md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-400`}>
              {t('about.intro')}
            </p>
            <p className={`text-gray-600 dark:text-gray-300 font-normal text-lg/relaxed md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-200`}>
              {t('about.experience')}
            </p>
            <p className={`text-gray-600 dark:text-gray-300 font-normal text-lg/relaxed md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ${fonts.text} transition-colors duration-200`}>
              {t('about.mission')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
