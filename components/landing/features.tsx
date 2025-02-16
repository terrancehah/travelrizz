import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/utils/cn"
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';

export default function Features() {
  const t = useTranslations('landing');
  const fonts = useLocalizedFont();

  const features = [
    {
      key: 'aiChat',
      image: "/images/ai-chat-interface.png",
    },
    {
      key: 'insights',
      image: "/images/generative-ui.png",
    },
    {
      key: 'routes',
      image: "/images/visualised-routes.png",
    },
    {
      key: 'itinerary',
      image: "/images/daily-itinerary-planning.png",
    },
  ]

  return (
    <section id="features" className="w-full py-16 flex items-center bg-slate-100/40 dark:bg-gray-900 transition-colors duration-400">
      <div className="container w-[80%] md:w-[90%] mx-auto">

        <h2 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 text-center mb-12 ${fonts.heading}`}>
          {t('features.title')}
        </h2>

        {/* Mobile Layout (default) */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="flex flex-col gap-y-4 p-6 bg-gray-100/80 dark:bg-gray-700/70 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <Image
                src={feature.image}
                alt={t(`features.items.${feature.key}.title`)}
                width={600}
                height={400}
                className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover w-full"
              />
              <div className="space-y-2">
                <h3 className={`text-xl md:text-2xl font-medium text-primary dark:text-sky-100 ${fonts.heading}`}>{t(`features.items.${feature.key}.title`)}</h3>
                <p className={`text-gray-600 dark:text-gray-300 text-lg leading-relaxed ${fonts.text}`}>{t(`features.items.${feature.key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet Layout (2x2 grid) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className="flex flex-col gap-y-4 p-6 bg-gray-100/80 dark:bg-gray-700/70 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <div className="relative w-full h-[300px]">
                <Image
                  src={feature.image}
                  alt={t(`features.items.${feature.key}.title`)}
                  fill
                  className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className={`text-xl md:text-2xl font-medium text-primary dark:text-sky-100 ${fonts.heading}`}>{t(`features.items.${feature.key}.title`)}</h3>
                <p className={`text-gray-600 dark:text-gray-300 text-lg leading-relaxed ${fonts.text}`}>{t(`features.items.${feature.key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8 mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className={cn(
                "group overflow-hidden rounded-xl bg-sky-100/50 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-300",
                index === 0 || index === 3 ? "col-span-8 h-[350px]" : "col-span-4 h-[350px]"
              )}
            >
              <div className={cn(
                "h-full w-full p-6 flex",
                index === 0 || index === 3 ? "flex-row items-center" : "flex-col"
              )}>
                <div className={cn(
                  "relative",
                  index === 0 || index === 3 ? "w-[62.5%] h-[100%]" : "w-full h-2/3"
                )}>
                  <Image
                    src={feature.image}
                    alt={t(`features.items.${feature.key}.title`)}
                    fill
                    className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </div>
                <div className={cn(
                  "flex flex-col justify-center",
                  index === 0 || index === 3 ? "w-[37.5%] pl-6" : "w-full h-1/2 pt-2"
                )}>
                  <h3 className={`text-xl font-medium font-raleway text-primary dark:text-sky-100 mb-2 ${fonts.heading}`}>{t(`features.items.${feature.key}.title`)}</h3>
                  <p className={`text-gray-600 dark:text-gray-300 text-md font-raleway leading-relaxed ${fonts.text}`}>{t(`features.items.${feature.key}.description`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="space-x-4 w-full pt-12 items-center flex justify-center">
          <Button asChild size="lg" className="bg-sky-blue/90 text-white hover:bg-sky-blue hover:shadow-md border border-slate-500">
            <Link href="/travel-form">Let's Plan Together</Link>
          </Button>
        </div> */}
      </div>
      
    </section>
  )
}
