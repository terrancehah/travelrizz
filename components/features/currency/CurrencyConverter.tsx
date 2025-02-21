import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { CurrencyConverterProps, CURRENCY_INFO } from '@/managers/types'
import { fetchExchangeRates, formatCurrencyAmount } from '@/utils/currency-utils'
import { CurrencyList } from './CurrencyList'
import { useLocalizedFont } from '@/hooks/useLocalizedFont'
import { useTranslations } from 'next-intl'

export function CurrencyConverter({ 
    baseCurrency, 
    baseAmount = 100,
    onAmountChange,
    defaultCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY']
}: CurrencyConverterProps) {
    const [amount, setAmount] = useState<number>(baseAmount)
    const [rates, setRates] = useState<{ [key: string]: number }>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const fonts = useLocalizedFont()
    const tComp = useTranslations('components')

    // Fetch exchange rates when component mounts or base currency changes
    useEffect(() => {
        const loadRates = async () => {
            if (!baseCurrency) return; // Add early return if baseCurrency is undefined
            try {
                setIsLoading(true)
                setError(null)
                const ratesData = await fetchExchangeRates(baseCurrency)
                setRates(ratesData)
                setLastUpdated(new Date())
                setIsLoading(false)
            } catch (err) {
                setError('Failed to load exchange rates. Please try again later.')
                setIsLoading(false)
            }
        }

        loadRates()
    }, [baseCurrency])

    // Filter rates to only include default currencies
    const currencyData = Object.fromEntries(
        Object.entries(rates)
            .filter(([code]) => defaultCurrencies.includes(code))
            .map(([code, rate]) => [
                code,
                {
                    name: CURRENCY_INFO[code]?.name || code,
                    rate
                }
            ])
    )

    const handleAmountChange = (value: number) => {
        setAmount(value)
        onAmountChange?.(value)
    }

    return (
        <div className="w-[70%] xl:w-fit mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-gray-200 dark:border-slate-500 mt-4">
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex flex-col items-center text-left w-full">
                        <label htmlFor="baseAmount" className={`${fonts.text} block text-lg font-semibold text-gray-700 dark:text-gray-200 self-start`}>
                            {tComp('currency.title', { currencyName: CURRENCY_INFO[baseCurrency || 'USD']?.name || baseCurrency || 'USD', currencySymbol: baseCurrency || 'USD' })}
                        </label>
                        <p className={`${fonts.text} text-md text-gray-500 dark:text-gray-400 text-left w-full`}>
                            {tComp('currency.subheading', { date: lastUpdated.toLocaleDateString() })}
                        </p>
                        <input
                            id="baseAmount"
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                            className="w-full mt-2 px-3 py-2 text-lg mx-auto font-bold 
                            bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200
                            border border-gray-300 dark:border-slate-600 
                            rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500
                            hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200"
                            placeholder="Enter amount"
                        />
                    </div>
                    {error ? (
                        <div className="flex items-center space-x-2 text-red-500 dark:text-red-400">
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    ) : isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div 
                                    key={i}
                                    className="h-10 w-full bg-gray-200 dark:bg-slate-700 animate-pulse rounded-lg"
                                />
                            ))}
                        </div>
                    ) : (
                        <CurrencyList
                            baseCurrency={baseCurrency || 'USD'}
                            amount={amount}
                            currencyData={currencyData}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
