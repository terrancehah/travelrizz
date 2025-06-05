'use client';

import React from 'react';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface QuickResponseProps {
    responses: string[];
    onResponseSelect: (text: string) => void;
    isLoading?: boolean;
}

export const QuickResponse: React.FC<QuickResponseProps> = ({
    responses,
    onResponseSelect,
    isLoading = false
}) => {
    const fonts = useLocalizedFont();

    if (isLoading) {
        // console.log('[QuickResponse] Loading...');
        return (
            <div className="flex flex-wrap gap-2 px-4 py-3 justify-start">
                {[1, 2, 3].map((key) => (
                    <div 
                        key={key}
                        className={`relative overflow-hidden min-w-[200px] ${fonts.text} px-3 py-1.5
                            before:absolute before:inset-0 before:z-0 before:bg-gradient-to-r 
                            before:from-blue-400 before:via-purple-500 before:to-pink-400 before: to-orange-500
                            before:animate-gradient-x before:bg-[length:200%_100%] after:absolute after:inset-0 
                            after:bg-white after:opacity-70 after:z-[1] animate-breathing-halo-500
                            rounded-2xl`}
                    >
                        &nbsp;
                    </div>
                ))}
            </div>
        );
    }
    
    if (!Array.isArray(responses) || responses.length === 0) {
        console.log('[QuickResponse] No responses to render');
        return null;
    }
    
    return (
        <div className="flex flex-wrap gap-2 px-4 py-3 justify-start
        transition-all duration-400">
            {responses.map((text, index) => (
                <button
                    key={index}
                    onClick={() => onResponseSelect(text)}
                    className={`min-w-fit max-w-[200px] ${fonts.text} px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900  dark:text-gray-100 dark:hover:text-white 
                            hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-200 dark:hover:bg-blue-500
                            backdrop-blur supports-[backdrop-filter]:bg-blue-200/60 dark:supports-[backdrop-filter]:bg-blue-600/60
                            hover:shadow-sm rounded-2xl transition-all 
                            whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                    {text}
                </button>
            ))}
        </div>
    );
};