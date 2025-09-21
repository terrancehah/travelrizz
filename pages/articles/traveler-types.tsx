import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Head from 'next/head';
import Link from 'next/link';
import { GlobeAltIcon, SparklesIcon, CurrencyDollarIcon, BuildingStorefrontIcon, ComputerDesktopIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ArticleNavigation from '@/components/articles/article-navigation';
import { useRouter } from 'next/router';

export default function TravelerTypes() {
    const t = useTranslations('articles');
    const fonts = useLocalizedFont();
    const { locale } = useRouter();
    const supportedLocales = ['en', 'fr', 'de', 'es', 'it', 'cs', 'ja', 'ko', 'ms', 'zh-CN', 'zh-TW'];
    const canonicalUrl = `https://travelrizz.app/articles/traveler-types`;
    const ogImageUrl = `https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575`;

    const travelerTypes = ['adventurer', 'cultural', 'foodie', 'luxury', 'budget', 'nomad'];
    type TravelerType = typeof travelerTypes[number];
    type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;

    const travelerIcons: Record<TravelerType, IconType> = {
        adventurer: GlobeAltIcon,
        cultural: PaintBrushIcon,
        foodie: BuildingStorefrontIcon,
        luxury: SparklesIcon,
        budget: CurrencyDollarIcon,
        nomad: ComputerDesktopIcon
    };

    return (
        <>
            <Head>
                <title>{t('travelerTypes.meta.title')} - Travel-Rizz</title>
                <meta name="description" content={t('travelerTypes.meta.description')} />

                {/* Standard SEO */} 
                <meta name="robots" content="index, follow" />
                <meta name="keywords" content="traveler types, travel persona, travel styles, ai trip planner, travel-rizz" />
                <link rel="canonical" href={canonicalUrl} />

                {/* Hreflang tags for internationalization */}
                {supportedLocales.map((lang) => {
                    const href = `https://travelrizz.app/${lang === 'en' ? '' : lang}/articles/traveler-types`;
                    return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
                })}
                <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

                {/* Open Graph for Social Media */}
                <meta property="og:title" content={`${t('travelerTypes.meta.title')} - Travel-Rizz`} />
                <meta property="og:description" content={t('travelerTypes.meta.description')} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="900" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${t('travelerTypes.meta.title')} - Travel-Rizz`} />
                <meta name="twitter:description" content={t('travelerTypes.meta.description')} />
                <meta name="twitter:image" content={ogImageUrl} />

            </Head>

            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="container w-[80%] mx-auto py-12 md:py-24">
                    <article className="max-w-4xl mx-auto">
                        <h1 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} mb-8`}>
                            {t('travelerTypes.title')}
                        </h1>

                        <div className={`prose dark:prose-invert max-w-none ${fonts.text}`}>
                            <div className="mb-12">
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                    {t('travelerTypes.introduction.content')}
                                </p>
                            </div>

                            <div className="mb-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {travelerTypes.map((type) => {
                                        const Icon = travelerIcons[type as TravelerType];
                                        return (
                                            <div key={type} className="p-6 bg-slate-100/40 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Icon className="h-8 w-8 text-primary dark:text-sky-400" />
                                                    <h2 className={`text-2xl text-gray-800 dark:text-gray-100 ${fonts.heading}`}>
                                                        {t(`travelerTypes.types.${type}.title`)}
                                                    </h2>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                    {t(`travelerTypes.types.${type}.description`)}
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h3 className={`${fonts.heading} text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200`}>
                                                        {t(`travelerTypes.types.${type}.howWeHelp.title`)}
                                                    </h3>
                                                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                                                        {(t.raw(`travelerTypes.types.${type}.howWeHelp.points`) as string[]).map((point, index) => (
                                                            <li key={index}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-12">
                                <h2 className="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 mb-6">
                                    {t('travelerTypes.help.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('travelerTypes.help.content')}
                                </p>
                            </div>

                            <div className="bg-sky-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                                <h2 className="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('travelerTypes.callToAction.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                                    {t('travelerTypes.callToAction.content')}
                                </p>
                                <Link
                                    href="/travel-form"
                                    className="inline-block bg-primary hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 text-white px-8 py-3 rounded-lg transition-colors duration-300 text-lg font-semibold"
                                >
                                    {t('travelerTypes.callToAction.button')}
                                </Link>
                            </div>
                        </div>
                    </article>

                    <ArticleNavigation 
                        next={{ href: '/articles/visa-guide', title: t('visa.meta.title') }}
                    />
                </div>
                <Footer />
            </div>
        </>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                articles: (await import(`../../public/locales/${locale}/articles.json`)).default,
                landing: (await import(`../../public/locales/${locale}/landing.json`)).default,
            },
        },
    };
}
