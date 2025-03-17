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
            image: "/images/generative-ui.jpg",
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
            className="flex flex-col rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 shadow-md"
            >
            {/* Image Section */}
            <div className="relative w-full">
            <Image
            src={feature.image}
            alt={t(`features.items.${feature.key}.title`)}
            width={600}
            height={400}
            className="bg-gray-100/80  object-cover w-full"
            />
            
            {/* Blur Overlay */}
            <div
            className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-b from-transparent via-sky-100/60 to-sky-100/80 dark:via-gray-700/40 dark:to-gray-700/80"
            style={{ backdropFilter: 'blur(1px)' }}
            />
            </div>
            
            <div className="space-y-2 p-6 pt-4 bg-sky-100/80 dark:bg-gray-700/80">
            <h3 className={`text-xl md:text-2xl font-medium text-primary dark:text-sky-100 ${fonts.text}`}>{t(`features.items.${feature.key}.title`)}</h3>
            <p className={`text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed ${fonts.text}`}>{t(`features.items.${feature.key}.description`)}</p>
            </div>
            </div>
        ))}
        </div>
        
        {/* Tablet Layout (2x2 grid) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
        {features.map((feature, index) => (
            <div
            key={feature.key}
            className="flex flex-col bg-sky-100/80 dark:bg-gray-700/70 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 shadow-md"
            >
            {/* Image Section */}
            <div className="relative w-full h-[300px]">
            <Image
            src={feature.image}
            alt={t(`features.items.${feature.key}.title`)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            className="object-cover"
            />
            
            {/* Blur Overlay */}
            <div
            className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-b from-transparent via-sky-100/60 to-sky-100/80 dark:via-gray-700/30 dark:to-gray-700/80"
            style={{ backdropFilter: 'blur(1px)' }}
            />
            </div>
            
            {/* Text Section */}
            <div className="space-y-2 p-6 pt-4">
            <h3 className={`text-xl md:text-2xl font-medium text-primary dark:text-sky-100 ${fonts.text}`}>{t(`features.items.${feature.key}.title`)}</h3>
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
                "group overflow-hidden rounded-xl shadow-md",
                index === 0 || index === 3 ? "col-span-8 h-[450px]" : "col-span-4 h-[450px]"
            )}
            >
            <div
            className={cn(
                "relative h-full w-full flex",
                index === 0 || index === 3 ? "flex-row items-center" : "flex-col"
            )}
            >
            {/* Image Section */}
            <div
            className={cn(
                "relative transition-all duration-300",
                index === 0 || index === 3 ? "w-[70%] h-[100%] mr-8" : "w-full h-3/5 mb-6"
            )}
            >
            <Image
            src={feature.image}
            alt={t(`features.items.${feature.key}.title`)}
            fill
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${index === 0 || index === 3 ? '66.66vw' : '33.33vw'}`}
            className="object-cover"
            />
            
            {/* Blur Overlay for flex-col (bottom edge) */}
            {!(index === 0 || index === 3) && (
                <div
                className="absolute -bottom-6 left-0 right-0 h-14 bg-gradient-to-b from-transparent via-sky-100/60 to-sky-100/80 dark:via-gray-700/50 dark:to-gray-700/80"
                style={{ backdropFilter: 'blur(1px)' }}
                />
            )}
            {/* Blur Overlay for flex-row (right edge) */}
            {(index === 0 || index === 3) && (
                <div
                className="absolute top-0 bottom-0 -right-8 w-24 bg-gradient-to-r from-transparent via-sky-100/50 to-sky-100/80 dark:via-gray-700/50 dark:to-gray-700/80"
                style={{ backdropFilter: 'blur(1px)'}}
                />
            )}
            </div>
            
            {/* Text Section */}
            <div
            className={cn(
                "flex flex-col justify-center p-6 bg-sky-100/80 dark:bg-gray-700/80 transition-all duration-300",
                index === 0 || index === 3
                ? "w-[30%] pl-0 h-full"
                : "w-full h-2/5 pt-0"
            )}
            >
            <h3
            className={`text-xl font-medium text-primary dark:text-sky-100 mb-2 ${fonts.text}`}
            >
            {t(`features.items.${feature.key}.title`)}
            </h3>
            <p
            className={`text-gray-600 dark:text-gray-300 text-md leading-relaxed ${fonts.text}`}
            >
            {t(`features.items.${feature.key}.description`)}
            </p>
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
