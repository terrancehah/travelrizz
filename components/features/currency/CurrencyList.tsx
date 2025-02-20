import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Euro, PoundSterling, CircleDollarSign } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLocalizedFont } from '@/hooks/useLocalizedFont'

const currencyIcons: Record<string, LucideIcon> = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    CNY: CircleDollarSign,
    JPY: CircleDollarSign,
}

interface CurrencyListProps {
    baseCurrency: string
    amount: number
    currencyData: Record<string, { name: string; rate: number }>
}

export function CurrencyList({ baseCurrency, amount, currencyData }: CurrencyListProps) {
    const fonts = useLocalizedFont()
    const convertedAmounts = useMemo(() => {
        return Object.entries(currencyData).reduce((acc, [currency, data]) => {
            acc[currency] = amount * data.rate
            return acc
        }, {} as Record<string, number>)
    }, [amount, currencyData])

    return (
        <ul className="space-y-2">
            {Object.entries(currencyData).map(([currency, data]) => {
                const Icon = currencyIcons[currency] || DollarSign
                return (
                    <motion.li
                        key={currency}
                        className="flex items-center justify-between p-2 px-3 mt-0 rounded-lg gap-x-4
                        bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 
                        transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center space-x-2">
                            {/* Currency Icon */}
                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full">
                                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            {/* Currency Name */}
                            <div>
                                <p className={`${fonts.text} font-bold text-sm text-gray-700 dark:text-gray-200`}>{currency}</p>
                                <p className={`${fonts.text} text-xs text-gray-500 dark:text-gray-400`}>{data.name}</p>
                            </div>
                        </div>
                        {/* Converted Amount */}
                        <div className="text-right">
                            <p className={`${fonts.text} text-sm font-bold text-gray-700 dark:text-gray-200`}>
                                {convertedAmounts[currency].toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <p className={`${fonts.text} text-xs text-gray-500 dark:text-gray-400`}>
                                1 {baseCurrency} = {data.rate.toFixed(4)} {currency}
                            </p>
                        </div>
                    </motion.li>
                )
            })}
        </ul>
    )
}
