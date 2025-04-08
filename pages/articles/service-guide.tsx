import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeftIcon, ChatBubbleBottomCenterTextIcon, MapIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';
import Image from 'next/image';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ArticleNavigation from '@/components/articles/article-navigation';

export default function ServiceGuide() {
    const t = useTranslations('articles');
    const fonts = useLocalizedFont();

    const steps = ['input', 'ai', 'customize', 'download'];
    const features = ['aiChat', 'insights', 'routes', 'itinerary'] as const;
    type FeatureType = typeof features[number];
    type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;
    
    const featureIcons: Record<FeatureType, IconType> = {
        aiChat: ChatBubbleBottomCenterTextIcon,
        insights: DocumentTextIcon,
        routes: MapIcon,
        itinerary: ClockIcon
    };

    return (
        <>
            <Head>
                <title>{t('service.meta.title')} - Travel-Rizz</title>
                <meta name="description" content={t('service.meta.description')} />
                <meta name="keywords" content={t('service.meta.keywords')} />
                <meta property="og:title" content={t('service.meta.title')} />
                <meta property="og:description" content={t('service.meta.description')} />
                <link rel="canonical" href="https://travelrizz.app/articles/service-guide" />
            </Head>

            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="container w-[80%] mx-auto py-12 md:py-24">
                    <article className="max-w-4xl mx-auto">
                        <h1 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} mb-8`}>
                            {t('service.title')}
                        </h1>

                        <div className={`prose dark:prose-invert max-w-none ${fonts.text}`}>
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('service.introduction.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('service.introduction.content')}
                                </p>
                            </div>

                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6">
                                    {t('service.workflow.title')}
                                </h2>
                                <div className="space-y-8">
                                    {steps.map((step, index) => (
                                        <div key={step} className="flex flex-col md:flex-row items-start gap-6 bg-slate-100/40 dark:bg-gray-800 p-6 rounded-lg">
                                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary dark:bg-sky-500 text-white rounded-full">
                                                <span className="text-xl font-semibold">{index + 1}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl text-gray-800 dark:text-gray-100 mb-3">
                                                    {t(`service.workflow.steps.${step}.title`)}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {t(`service.workflow.steps.${step}.description`)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6">
                                    {t('service.features.title')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {features.map((feature) => {
                                        const Icon = featureIcons[feature];
                                        return (
                                            <div key={feature} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Icon className="h-6 w-6 text-primary dark:text-sky-400" />
                                                    <h3 className="text-xl text-gray-800 dark:text-gray-100">
                                                        {t(`service.features.list.${feature}.title`)}
                                                    </h3>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {t(`service.features.list.${feature}.description`)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-sky-50 dark:bg-gray-800 p-6 rounded-lg">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('service.cta.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t('service.cta.content')}
                                </p>
                                <Link
                                    href="/travel-form"
                                    className="inline-block bg-primary hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                >
                                    {t('service.cta.button')}
                                </Link>
                            </div>
                        </div>
                    </article>

                    <ArticleNavigation 
                        prev={{
                            title: t('visa.title'),
                            href: '/articles/visa-guide'
                        }}
                        next={{
                            title: t('preparation.title'),
                            href: '/articles/trip-preparation'
                        }}
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
