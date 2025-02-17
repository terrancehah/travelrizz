import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'zh-CN', 'zh-TW', 'ms', 'es', 'fr', 'de', 'it', 'cs', 'ja', 'ko'] as const;
export type Locale = typeof locales[number];

export const defaultLocale = 'en' as const;
export const defaultTimeZone = 'Asia/Singapore' as const;

export function getLocale(locale: string | undefined) {
    if (!locale) return defaultLocale;
    return locales.includes(locale as Locale) ? locale : defaultLocale;
}

export const {Link, usePathname, useRouter} = createSharedPathnamesNavigation({locales});
