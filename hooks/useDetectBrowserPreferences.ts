import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

// Map browser language codes to our supported locales
const browserLocaleMap: Record<string, string> = {
    'en': 'en',        // English
    'en-US': 'en',     // English (US)
    'en-GB': 'en',     // English (UK)
    'ms': 'ms',        // Malay
    'es': 'es',        // Spanish
    'fr': 'fr',        // French
    'de': 'de',        // German
    'it': 'it',        // Italian
    'cs': 'cs',        // Czech
    'zh': 'zh-CN',     // Chinese (simplified is more common)
    'zh-CN': 'zh-CN',  // Chinese (Simplified)
    'zh-TW': 'zh-TW',  // Chinese (Traditional)
    'ja': 'ja',        // Japanese
    'ko': 'ko',        // Korean
};

export function useDetectBrowserPreferences() {
    const { setTheme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        // Only run on client-side
        if (typeof window === 'undefined') return;

        // 1. Apply time-based theme
        const applyTimeBasedTheme = () => {
        const currentHour = new Date().getHours();
        // Dark mode between 7 PM (19) and 7 AM (7)
        const isDarkHours = currentHour >= 19 || currentHour < 7;
        setTheme(isDarkHours ? 'dark' : 'light');
        };

        // Apply immediately and then setup continuous checking
        applyTimeBasedTheme();

        // 2. Detect and apply browser locale
        const detectAndApplyLocale = () => {
        // Skip if we're already on a non-default locale path
        if (router.locale !== router.defaultLocale) return;

        const browserLanguages = navigator.languages || [navigator.language];
        
        // Try to find a matching locale from browser's preferred languages
        let matchedLocale: string | null = null;
        
        for (const lang of browserLanguages) {
            // First try the exact language code
            if (lang in browserLocaleMap) {
            matchedLocale = browserLocaleMap[lang];
            break;
            }
            
            // Then try the language family (e.g., 'en-US' -> 'en')
            const langFamily = lang.split('-')[0];
            if (langFamily in browserLocaleMap) {
            matchedLocale = browserLocaleMap[langFamily];
            break;
            }
        }
        
        // If matched locale is different from current
        if (matchedLocale && matchedLocale !== router.locale) {
            router.push(router.asPath, router.asPath, { 
            locale: matchedLocale, 
            scroll: false 
            });
        }
        };

        detectAndApplyLocale();
    }, [setTheme, router]);
}