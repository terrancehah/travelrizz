import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ArticleLink {
    title: string;
    href: string;
}

interface ArticleNavigationProps {
    prev?: ArticleLink;
    next?: ArticleLink;
}

export default function ArticleNavigation({ prev, next }: ArticleNavigationProps) {
    const t = useTranslations('articles');
    const fonts = useLocalizedFont();

    return (
        <div className="border-gray-200 dark:border-gray-700 mt-16 pt-8">
            <nav className="flex justify-between">
                {prev ? (
                    <Link
                        href={prev.href}
                        className={`group flex items-center ${fonts.text} text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-100 transition-colors duration-300`}
                    >
                        <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t('navigation.previous')}
                            </div>
                            <div className="font-medium">{prev.title}</div>
                        </div>
                    </Link>
                ) : <div />}

                {next ? (
                    <Link
                        href={next.href}
                        className={`group flex items-center text-right ${fonts.text} text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-100 transition-colors duration-300`}
                    >
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t('navigation.next')}
                            </div>
                            <div className="font-medium">{next.title}</div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                ) : <div />}
            </nav>
        </div>
    );
}
