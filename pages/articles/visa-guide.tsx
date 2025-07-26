import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ArticleNavigation from '@/components/articles/article-navigation';

export default function VisaGuide() {
    const t = useTranslations('articles');
    const fonts = useLocalizedFont();

    return (
        <>
            <Head>
                <title>{t('visa.meta.title')} - Travel-Rizz</title>
                <meta name="description" content={t('visa.meta.description')} />
                <meta name="keywords" content={t('visa.meta.keywords')} />
                <meta property="og:title" content={t('visa.meta.title')} />
                <meta property="og:description" content={t('visa.meta.description')} />
                <meta property="og:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="900" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />
                <link rel="canonical" href="https://travelrizz.app/articles/visa-guide" />
            </Head>

            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="container w-[80%] mx-auto py-12 md:py-24">
                    <article className="max-w-4xl mx-auto">
                        <h1 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} mb-8`}>
                            {t('visa.title')}
                        </h1>

                        <div className={`prose dark:prose-invert max-w-none ${fonts.text}`}>
                            {/* Introduction */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.introduction.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('visa.introduction.content')}
                                </p>
                            </div>

                            {/* Popular Destinations */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.popular.title')}
                                </h2>
                                <div className="space-y-6">
                                    {['europe', 'usa', 'japan', 'australia'].map((country) => (
                                        <div key={country} className="bg-slate-100/40 dark:bg-gray-800 p-6 rounded-lg">
                                            <h3 className="text-xl text-gray-800 dark:text-gray-100 mb-3">
                                                {t(`visa.popular.countries.${country}.title`)}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {t(`visa.popular.countries.${country}.requirements`)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step-by-Step Application Guide */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.steps.title')}
                                </h2>
                                <div className="space-y-6">
                                    {['europe', 'usa', 'japan', 'australia'].map((country) => (
                                        <div key={country} className="bg-slate-100/40 dark:bg-gray-800 p-6 rounded-lg">
                                            <h3 className="text-xl text-gray-800 dark:text-gray-100 mb-3">
                                                {t(`visa.steps.countries.${country}.title`)}
                                            </h3>
                                            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                                {Object.keys(t.raw(`visa.steps.countries.${country}.list`)).map((step) => (
                                                    <li key={step}>{t(`visa.steps.countries.${country}.list.${step}`)}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Common Mistakes */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.mistakes.title')}
                                </h2>
                                <ul className="space-y-4">
                                    {Object.keys(t.raw('visa.mistakes.list')).map((mistake) => (
                                        <li key={mistake} className="flex items-start">
                                            <span className="text-primary dark:text-sky-100 mr-2">•</span>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {t(`visa.mistakes.list.${mistake}`)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visa-Free Travel */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.visafree.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t('visa.visafree.content')}
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-gray-600 dark:text-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200 dark:bg-gray-700">
                                                <th className="p-3">{t('visa.visafree.table.destination')}</th>
                                                <th className="p-3">{t('visa.visafree.table.type')}</th>
                                                <th className="p-3">{t('visa.visafree.table.cost')}</th>
                                                <th className="p-3">{t('visa.visafree.table.validity')}</th>
                                                <th className="p-3">{t('visa.visafree.table.stay')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {['usa', 'canada', 'europe'].map((entry) => (
                                                <tr key={entry} className="border-b dark:border-gray-700">
                                                    <td className="p-3">{t(`visa.visafree.table.entries.${entry}.destination`)}</td>
                                                    <td className="p-3">{t(`visa.visafree.table.entries.${entry}.type`)}</td>
                                                    <td className="p-3">{t(`visa.visafree.table.entries.${entry}.cost`)}</td>
                                                    <td className="p-3">{t(`visa.visafree.table.entries.${entry}.validity`)}</td>
                                                    <td className="p-3">{t(`visa.visafree.table.entries.${entry}.stay`)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Travel Insurance */}
                            <div className="mb而已">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.insurance.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('visa.insurance.content')}
                                </p>
                            </div>

                            {/* Tips */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.tips.title')}
                                </h2>
                                <ul className="space-y-4">
                                    {['early', 'documents', 'insurance', 'embassy'].map((tip) => (
                                        <li key={tip} className="flex items-start">
                                            <span className="text-primary dark:text-sky-100 mr-2">•</span>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {t(`visa.tips.list.${tip}`)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visa Preparation Checklist */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.checklist.title')}
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-gray-600 dark:text-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200 dark:bg-gray-700">
                                                <th className="p-3">{t('visa.checklist.table.item')}</th>
                                                <th className="p-3">{t('visa.checklist.table.details')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(t.raw('visa.checklist.table.items')).map((item) => (
                                                <tr key={item} className="border-b dark:border-gray-700">
                                                    <td className="p-3">{t(`visa.checklist.table.items.${item}.name`)}</td>
                                                    <td className="p-3">{t(`visa.checklist.table.items.${item}.details`)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resources */}
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.resources.title')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(t.raw('links.official.visa')).map(([key, resource]: [string, any]) => (
                                        <a
                                            key={key}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-sky-500 transition-colors duration-300"
                                        >
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-sky-400">
                                                    {resource.title}
                                                </h3>
                                                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                {resource.description}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="bg-sky-50 dark:bg-gray-800 p-6 rounded-lg">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('visa.help.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t('visa.help.content')}
                                </p>
                                <Link
                                    href="/travel-form"
                                    className="inline-block bg-primary hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                >
                                    {t('visa.help.cta')}
                                </Link>
                            </div>
                        </div>
                    </article>

                    <ArticleNavigation 
                        prev={{ href: '/articles/traveler-types', title: t('travelerTypes.meta.title') }}
                        next={{ href: '/articles/service-guide', title: t('service.meta.title') }}
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