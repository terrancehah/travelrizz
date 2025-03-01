// LocalTips.tsx
// This component displays destination-specific travel tips and cultural etiquettes
// in a collapsible format. Each tip has a summary view that expands to show
// more detailed information when clicked.

'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

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

    // Toggle expansion state of a tip
    const toggleTip = (index: number) => {
        setExpandedTips(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="w-[70%] bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mt-4 mx-auto">
            <h3 className={cn(
                "text-lg font-semibold mb-4",
                "text-gray-600 dark:text-gray-300",
                fonts.text
            )}>
                Local Tips for {destination}
            </h3>
            <div className="space-y-2">
                {tips.map((tip, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => toggleTip(index)}
                            className={cn(
                                "w-full px-4 py-3 flex items-center justify-between",
                                "text-left transition-colors duration-500",
                                "bg-slate-100/40 dark:bg-gray-800",
                                "hover:bg-sky-100/60 dark:hover:bg-gray-700",
                                "focus:outline-none focus:ring-2 focus:ring-sky-500",
                                fonts?.text
                            )}
                        >
                            <div className="flex-1">
                                <p className={cn(
                                    "text-gray-600 dark:text-gray-300 pr-2",
                                    expandedTips.includes(index) && "font-bold"
                                )}>
                                    {tip.summary}
                                </p>
                                <div className={cn(
                                    "overflow-hidden transition-[max-height] duration-500 ease-in-out",
                                    expandedTips.includes(index) ? "max-h-[500px]" : "max-h-0"
                                )}>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                                        {tip.description}
                                    </p>
                                </div>
                            </div>
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
