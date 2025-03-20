import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { CurrencyConverterProps, CURRENCY_INFO } from '@/managers/types'
import { formatCurrencyAmount } from '@/utils/currency-utils'
import { CurrencyList } from './currency-list'
import { useLocalizedFont } from '@/hooks/useLocalizedFont'
import { useTranslations } from 'next-intl'

export function CurrencyConverter({ 
    baseCurrency, 
    baseAmount = 100,
    onAmountChange,
    defaultCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'],
    rates: initialRates = {}
}: CurrencyConverterProps) {
    const [amount, setAmount] = useState<number>(baseAmount)
    const [rates, setRates] = useState<{ [key: string]: number }>(initialRates)
    const [isLoading, setIsLoading] = useState<boolean>(Object.keys(initialRates).length === 0)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const fonts = useLocalizedFont()
    const tComp = useTranslations('components')

    // Use rates from props if available, otherwise fetch them
    useEffect(() => {
        // If we already have rates from props, use those
        if (Object.keys(initialRates).length > 0) {
            setRates(initialRates)
            setIsLoading(false)
            return
        }
        
        // Otherwise, use the rates that were passed in the props
        setRates(initialRates)
        setIsLoading(false)
    }, [baseCurrency, initialRates])

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
                            {tComp('currency.subheading', { lastUpdated: lastUpdated.toLocaleDateString() })}
                        </p>
                        <input
                            id="baseAmount"
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                            className="w-full mt-2 px-3 py-2 text-lg mx-auto font-bold 
                            bg-sky-100/70 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                            border border-gray-200 dark:border-gray-600
                            rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                            hover:bg-sky-200/70 dark:hover:bg-gray-700 transition-colors duration-200"
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
