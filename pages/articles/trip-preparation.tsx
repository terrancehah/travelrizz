import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeftIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ArticleNavigation from '@/components/articles/article-navigation';

// Helper function to convert markdown-style links to JSX
const renderWithLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
            <a
                key={match.index}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 inline-flex items-center gap-1 underline"
            >
                {match[1]}
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
        );
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts;
};

export default function TripPreparation() {
    const t = useTranslations('articles');
    const fonts = useLocalizedFont();

    const categories = ['documentation', 'packing', 'booking', 'health', 'finance'];

    return (
        <>
            <Head>
                <title>Your Ultimate Trip Preparation Guide for 2025 - Travel-Rizz</title>
                <meta
                    name="description"
                    content="Prepare for your 2025 adventure with our travel planning checklist! Get expert tips on trip preparation, packing lists, and more. Start your journey today!"
                />
                <meta
                    name="keywords"
                    content="trip preparation, travel planning, packing list, travel checklist, international travel preparation, health requirements for travel"
                />
                <meta property="og:title" content="Your Ultimate Trip Preparation Guide for 2025 - Travel-Rizz" />
                <meta
                    property="og:description"
                    content="Prepare for your 2025 adventure with our travel planning checklist! Get expert tips on trip preparation, packing lists, and more. Start your journey today!"
                />
                <meta property="og:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="900" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://opengraph.b-cdn.net/production/images/92208d0d-9316-4bdf-b3c6-307ae71fa951.jpg?token=aBf1vZ_HMp8u6j70oAHDe5B4MDLqT2j5nNKKpWxwFoM&height=900&width=1200&expires=33278759575" />
                <link rel="canonical" href="https://travelrizz.app/articles/trip-preparation" />
            </Head>

            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="container w-[80%] mx-auto py-12 md:py-24">
                    <article className="max-w-4xl mx-auto">
                        <h1
                            className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} mb-8`}
                        >
                            {t('preparation.title') || 'How to Prepare for a Trip: Your Ultimate Guide'}
                        </h1>

                        <div className={`prose dark:prose-invert max-w-none ${fonts.text}`}>
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('preparation.introduction.title') || 'Introduction to Travel Planning'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {renderWithLinks(
                                        t('preparation.introduction.content') ||
                                            'Trip preparation is the key to a stress-free journey. Whether you’re creating a packing list or sorting out travel documents, our guide offers everything you need for seamless travel planning.'
                                    )}
                                </p>
                            </div>

                            {categories.map((category) => (
                                <div key={category} className="mb-12">
                                    <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6">
                                        {t(`preparation.categories.${category}.title`) ||
                                            `${category.charAt(0).toUpperCase() + category.slice(1)} for Travel`}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        {renderWithLinks(
                                            t(`preparation.categories.${category}.description`) ||
                                                `Learn how to handle ${category} as part of your trip preparation with our expert travel checklist.`
                                        )}
                                    </p>
                                    <div className="bg-slate-100/40 dark:bg-gray-800 p-6 rounded-lg">
                                        <ul className="space-y-4">
                                            {['item1', 'item2', 'item3', 'item4'].map((item) => (
                                                <li key={item} className="flex items-start">
                                                    <CheckCircleIcon className="h-6 w-6 text-primary dark:text-sky-100 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {renderWithLinks(
                                                            t(
                                                                `preparation.categories.${category}.checklist.${item}`
                                                            ) || `${category} checklist item ${item}`
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        {category === 'packing' && (
                                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                                <h3 className="text-xl text-gray-800 dark:text-gray-100 mb-4">
                                                    {t('preparation.categories.packing.genderSpecific.title') ||
                                                        'Gender-Specific Packing List Tips'}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                    {renderWithLinks(
                                                        t(
                                                            'preparation.categories.packing.genderSpecific.description'
                                                        ) ||
                                                            'Tailor your packing list with gender-specific travel preparation tips for a smooth journey.'
                                                    )}
                                                </p>
                                                <ul className="space-y-4">
                                                    {['item1', 'item2', 'item3'].map((item) => (
                                                        <li key={item} className="flex items-start">
                                                            <CheckCircleIcon className="h-6 w-6 text-primary dark:text-sky-100 mr-3 flex-shrink-0" />
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {renderWithLinks(
                                                                    t(
                                                                        `preparation.categories.packing.genderSpecific.checklist.${item}`
                                                                    ) || `Gender-specific item ${item}`
                                                                )}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6">
                                    {t('preparation.timeline.title') || 'Travel Preparation Timeline'}
                                </h2>
                                <div className="space-y-6">
                                    {['months3', 'months1', 'weeks2', 'days1'].map((time) => (
                                        <div
                                            key={time}
                                            className="bg-slate-100/40 dark:bg-gray-800 p-6 rounded-lg"
                                        >
                                            <h3 className="text-xl text-gray-800 dark:text-gray-100 mb-3">
                                                {t(`preparation.timeline.${time}.title`) ||
                                                    `${time.replace('months', 'Months ').replace('weeks', 'Weeks ').replace('days', 'Days ')} Before Your Trip`}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {renderWithLinks(
                                                    t(`preparation.timeline.${time}.tasks`) ||
                                                        `Key tasks for your travel checklist ${time} before departure.`
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6">
                                    Official Health Resources for Travel
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {Object.entries(t.raw('links.official.health') || {}).map(
                                        ([key, resource]: [string, any]) => (
                                            <a
                                                key={key}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-sky-500 transition-colors duration-300"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-sky-400">
                                                        {resource.title || 'Health Resource'}
                                                    </h3>
                                                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                                                </div>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                    {renderWithLinks(
                                                        resource.description ||
                                                            'Check health requirements for travel with this official resource.'
                                                    )}
                                                </p>
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="bg-sky-50 dark:bg-gray-800 p-6 rounded-lg">
                                <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4">
                                    {t('preparation.planner.title') || 'Ready to Start Travel Planning?'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {renderWithLinks(
                                        t('preparation.planner.content') ||
                                            'Use our AI-powered tool to create your personalized trip preparation checklist now!'
                                    )}
                                </p>
                                <Link
                                    href="/travel-form"
                                    className="inline-block bg-primary hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                >
                                    {t('preparation.planner.cta') || 'Start Planning Your Trip Now!'}
                                </Link>
                            </div>
                        </div>
                    </article>

                    <ArticleNavigation
                        prev={{ href: '/articles/service-guide', title: t('service.meta.title') }}
                        next={{
                            title: t('travelerTypes.title'),
                            href: '/articles/traveler-types'
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