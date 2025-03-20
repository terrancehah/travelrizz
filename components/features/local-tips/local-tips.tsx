// LocalTips.tsx
// This component displays destination-specific travel tips and cultural etiquettes
// in a collapsible format. Each tip has a summary view that expands to show
// more detailed information when clicked.

'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { useTranslations } from 'next-intl';

// Interface for individual tip data structure
export interface LocalTip {
    summary: string;    // Brief overview shown in collapsed state
    description: string; // Detailed explanation shown when expanded
}

// Props for the LocalTips component
export interface LocalTipsProps {
    tips: LocalTip[];      // Array of tips to display
    destination: string;   // Destination name for the header
}

const LocalTips: React.FC<LocalTipsProps> = ({ tips, destination }) => {
    // Track which tips are currently expanded
    const [expandedTips, setExpandedTips] = useState<number[]>([]);
    const fonts = useLocalizedFont();
    const tComp = useTranslations('components');

    // Toggle expansion state of a tip
    const toggleTip = (index: number) => {
        setExpandedTips(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="w-[90%] md:w-[70%] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 mt-4 mx-auto">
            {/* Component Title */}
            <h3 className={cn(
                "text-lg font-semibold mb-3",
                "text-gray-600 dark:text-gray-300",
                fonts.text
            )}>
                {tComp('localTips.title', { destination })}
            </h3>
            {/* Tips Container */}
            <div className="space-y-2">
                {tips.map((tip, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                        {/* Tips Buttons */}
                        <button
                            onClick={() => toggleTip(index)}
                            className={cn(
                                "w-full px-3 py-2 flex items-center justify-between",
                                "text-left transition-colors duration-500",
                                "bg-sky-100/40 dark:bg-gray-800",
                                "hover:bg-sky-100/80 dark:hover:bg-gray-700",
                                "focus:outline-none focus:ring-2 focus:ring-sky-500",
                                fonts?.text
                            )}
                        >
                            <div className={cn(
                                "flex-1 overflow-hidden transition-[max-height] duration-500 ease-in-out",
                                expandedTips.includes(index) ? "max-h-[500px]" : "max-h-[20px]"
                            )}>
                                {/* Summarised Tips */}
                                <p className={cn(
                                    "text-gray-600 dark:text-gray-300 pr-2 text-sm my-auto",
                                    expandedTips.includes(index) ? "font-semibold" : "font-normal",
                                    fonts?.text
                                )}>
                                    {tip.summary}

                                    {/* Tips Description */}
                                    <span className={cn(
                                        "transition-[opacity,visibility] duration-400 ease-in-out font-normal",
                                        expandedTips.includes(index) 
                                            ? "opacity-100 visible" 
                                            : "opacity-0 invisible"
                                    )}>
                                        {""}: {tip.description}
                                    </span>
                                </p>
                            </div>
                            {/* Chevron Icon */}
                            <div className={cn(
                                "transition-transform duration-300 flex-shrink-0 ml-2",
                                expandedTips.includes(index) && "rotate-90"
                            )}>
                                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocalTips;
