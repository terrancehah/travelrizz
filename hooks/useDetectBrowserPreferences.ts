import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

// Map browser language codes to our supported locales
// const browserLocaleMap: Record<string, string> = {
//     'en': 'en',        // English
//     'en-US': 'en',     // English (US)
//     'en-GB': 'en',     // English (UK)
//     'ms': 'ms',        // Malay
//     'es': 'es',        // Spanish
//     'fr': 'fr',        // French
//     'de': 'de',        // German
//     'it': 'it',        // Italian
//     'cs': 'cs',        // Czech
//     'zh': 'zh-CN',     // Chinese (simplified is more common)
//     'zh-CN': 'zh-CN',  // Chinese (Simplified)
//     'zh-TW': 'zh-TW',  // Chinese (Traditional)
//     'ja': 'ja',        // Japanese
//     'ko': 'ko',        // Korean
// };

export function useDetectBrowserPreferences() {
    const { setTheme } = useTheme();
    // const router = useRouter();

    // Run only once on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // One-time theme detection based on local time
        const currentHour = new Date().getHours();
        const isDarkHours = currentHour >= 19 || currentHour < 7;
        setTheme(isDarkHours ? 'dark' : 'light');

        // One-time locale detection
        // const browserLanguages = navigator.languages || [navigator.language];
        // let matchedLocale = null;
        
        // for (const lang of browserLanguages) {
        //     if (lang in browserLocaleMap) {
        //         matchedLocale = browserLocaleMap[lang];
        //         break;
        //     }
            
        //     const langFamily = lang.split('-')[0];
        //     if (langFamily in browserLocaleMap) {
        //         matchedLocale = browserLocaleMap[langFamily];
        //         break;
        //     }
        // }
        
        // if (matchedLocale && matchedLocale !== router.locale) {
        //     router.push(router.asPath, router.asPath, { 
        //         locale: matchedLocale, 
        //         scroll: false 
        //     });
        // }
    }, []); // Empty dependency array = run once on mount only
}