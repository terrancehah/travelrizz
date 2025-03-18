import { CurrencyCache, CURRENCY_INFO } from '@/managers/types';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY = 'currency_cache';

export async function fetchExchangeRates(baseCurrency: string): Promise<{ [key: string]: number }> {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
    
    // Try to get cached data first if in browser
    if (isBrowser) {
        const cachedData = getCachedRates(baseCurrency);
        if (cachedData) {
            return cachedData;
        }
    }

    try {
        // Use direct API call with absolute URL
        const apiKey = process.env.FREECURRENCY_API_KEY;
        if (!apiKey) {
            throw new Error('FreeCurrency API key is missing');
        }
        
        const response = await fetch(
            `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.data || typeof data.data !== 'object') {
            throw new Error('Invalid API response format');
        }
        
        // Cache the response if in browser
        if (isBrowser) {
            const cache: CurrencyCache = {
                timestamp: Date.now(),
                rates: data.data,
                baseCurrency
            };
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
}

export function getCachedRates(baseCurrency: string): { [key: string]: number } | null {
    try {
        const cacheStr = sessionStorage.getItem(CACHE_KEY);
        if (!cacheStr) return null;

        const cache: CurrencyCache = JSON.parse(cacheStr);
        
        // Check if cache is expired or for a different base currency
        if (
            Date.now() - cache.timestamp > CACHE_DURATION ||
            cache.baseCurrency !== baseCurrency
        ) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }

        return cache.rates;
    } catch {
        return null;
    }
}

export function formatCurrencyAmount(amount: number, currency: string): string {
    const info = CURRENCY_INFO[currency];
    if (!info) return `${currency} ${amount.toFixed(2)}`;

    const { symbol, position } = info;
    const formatted = amount.toFixed(2);

    return position === 'before' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

export function getCurrencyFromCountry(country: string): string {
    const countryToCurrency: { [key: string]: string } = {
        'Singapore': 'SGD',
        'Malaysia': 'MYR',
        'United States': 'USD',
        'Japan': 'JPY',
        'China': 'CNY',
        'United Kingdom': 'GBP',
        'European Union': 'EUR',
        'Australia': 'AUD',
        'Canada': 'CAD',
        'South Korea': 'KRW',
        'India': 'INR',
        'Thailand': 'THB',
        'Indonesia': 'IDR',
        'United Arab Emirates': 'AED',
        'Saudi Arabia': 'SAR',
        'Brazil': 'BRL',
        'Russia': 'RUB',
        'Switzerland': 'CHF',
        'New Zealand': 'NZD',
        'Vietnam': 'VND',
        'Turkey': 'TRY',
        'South Africa': 'ZAR'
    };

    function findCountryInString(input: string): string | null {
        const searchTerms = input.split(/[,\s]+/);
        for (const term of searchTerms) {
            const normalizedTerm = term.trim().toLowerCase();
            const match = Object.keys(countryToCurrency).find(country => 
                country.toLowerCase() === normalizedTerm
            );
            if (match) return match;
        }
        return null;
    }

    const detectedCountry = findCountryInString(country) || 'United States';
    return countryToCurrency[detectedCountry] || 'USD';
}
