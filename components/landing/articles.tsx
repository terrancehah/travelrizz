import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ArticleCard {
    title: string;
    description: string;
    href: string;
    icon: string;
}

export default function Articles() {
    const t = useTranslations('landing');
    const fonts = useLocalizedFont();

    const articles: ArticleCard[] = [
        {
            title: t('articles.travelerTypes.title'),
            description: t('articles.travelerTypes.description'),
            href: '/articles/traveler-types',
            icon: '🧑‍🤝‍🧑'
        },
        {
            title: t('articles.visa.title'),
            description: t('articles.visa.description'),
            href: '/articles/visa-guide',
            icon: '🛂'
        },
        {
            title: t('articles.service.title'),
            description: t('articles.service.description'),
            href: '/articles/service-guide',
            icon: '🧭'
        },
        {
            title: t('articles.preparation.title'),
            description: t('articles.preparation.description'),
            href: '/articles/trip-preparation',
            icon: '✈️'
        }
    ];

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-100/40 dark:bg-gray-900">
            <div className="container w-[80%] mx-auto">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <h2 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} transition-colors duration-400 text-center`}>
                        {t('articles.title')}
                    </h2>
                    <p className={`text-gray-600 dark:text-gray-300 text-lg md:text-xl text-center max-w-3xl ${fonts.text}`}>
                        {t('articles.subtitle')}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mt-8">
                        {articles.map((article) => (
                            <Link 
                                key={article.href}
                                href={article.href}
                                className="group relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="text-4xl mb-4">{article.icon}</div>
                                <h3 className={`${fonts.text} text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary dark:group-hover:text-sky-100 transition-colors duration-300`}>
                                    {article.title}
                                </h3>
                                <p className={`${fonts.text} text-gray-600 dark:text-gray-300 mb-4`}>
                                    {article.description}
                                </p>
                                <div className="mt-auto flex items-center text-primary dark:text-sky-100 group-hover:translate-x-2 transition-transform duration-300">
                                    <span className={`${fonts.text}`}>{t('articles.readMore')}</span>
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
