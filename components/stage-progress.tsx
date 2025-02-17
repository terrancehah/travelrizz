'use client';

import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Info } from 'lucide-react';
import PaymentSuccessPopup from './modals/payment-success-popup';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface StageProgressProps {
    currentStage: number;
    isPaid: boolean;
}

interface StepsRootProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    colorPalette?: 'gray' | 'blue';
    variant?: 'subtle' | 'solid';
    size?: 'sm' | 'md' | 'lg';
}

export const StepsRoot = React.forwardRef<HTMLDivElement, StepsRootProps>(
    ({ className, orientation = 'horizontal', colorPalette = 'blue', variant = 'solid', size = 'md', ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'w-full sticky top-0 z-40',
                orientation === 'vertical' ? 'flex-col' : 'flex',
                className
            )}
            {...props}
        />
    )
);
StepsRoot.displayName = 'StepsRoot';

export interface StepsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const StepsList = React.forwardRef<HTMLDivElement, StepsListProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'mx-auto w-full px-2 py-2 overflow-x-auto',
                className
            )}
            {...props}
        >
            <div className="flex justify-around">
                <div className="flex items-center gap-4">
                    {props.children}
                </div>
            </div>
        </div>
    )
);
StepsList.displayName = 'StepsList';

export interface StepsItemProps extends React.HTMLAttributes<HTMLDivElement> {
    step: number;
    currentStep: number;
    title: string;
    description?: string;
    isLocked?: boolean;
    isLast?: boolean;
}

export const StepsItem = React.forwardRef<HTMLDivElement, StepsItemProps>(
    ({ className, step, currentStep, title, description, isLocked, isLast, ...props }, ref) => {
        const fonts = useLocalizedFont();
        
        return (
            <>
                <div className="flex flex-col items-center gap-1 relative md:w-40" ref={ref} {...props}>
                    
                    {/* Steps Numbers */}
                    <div 
                        className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                            currentStep > step ? 'bg-green-500' : 
                            currentStep === step ? 'bg-blue-600/80 dark:bg-blue-500' : 
                            'bg-gray-200 dark:bg-gray-600',
                            isLocked ? 'cursor-not-allowed' : '',
                            className
                        )}
                    >
                        {currentStep > step ? (
                            <CheckIcon className="w-5 h-5 text-white" />
                        ) : (
                            <span className={cn(
                                'text-sm',
                                currentStep === step ? 'text-white' : 'text-gray-600 dark:text-gray-200'
                            )}>
                                {step}
                            </span>
                        )}
                    </div>

                    {/* Steps Descriptions */}
                    <div className="hidden md:flex flex-col items-start mt-1">
                        <span className={`text-sm ${fonts.text} font-medium text-center text-primary dark:text-gray-200 transition-colors duration-400`}>{title}</span>
                        {/* {description && (
                            <span className="text-xs text-gray-500">{description}</span>
                        )} */}
                    </div>
                    {isLocked && (
                        <LockClosedIcon className="w-4 h-4 text-gray-700 dark:text-gray-300 absolute -top-1 -right-2 md:right-12" />
                    )}
                </div>
                {!isLast && (
                    <div className="hidden md:block flex-1 h-[2px] bg-gray-200">
                        <div
                            className={cn(
                                'h-full bg-green-500 transition-all',
                                currentStep > step ? 'w-full' : 'w-0'
                            )}
                        />
                    </div>
                )}
            </>
        );
    }
);
StepsItem.displayName = 'StepsItem';

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, isPaid }) => {
    const t = useTranslations('travelChat');

    const stages = [
        { id: 1, title: t('stages.stage1') },
        { id: 2, title: t('stages.stage2') },
        { id: 3, title: t('stages.stage3') },
        { id: 4, title: t('stages.stage4') },
        { id: 5, title: t('stages.stage5') }
    ];

    const [showPopup, setShowPopup] = useState(false);

    return (
        <StepsRoot>
            <StepsList>
                {stages.map((stage, index) => (
                    <StepsItem
                        key={stage.id}
                        step={stage.id}
                        currentStep={currentStage}
                        title={stage.title}
                        isLocked={currentStage <= 3 && (stage.id === 4 || stage.id === 5)}
                        isLast={index === stages.length - 1}
                    />
                ))}

                {/* Stages 4 and 5 Info Button */}
                {currentStage > 3 && (
                    <button 
                        onClick={() => setShowPopup(true)}
                        className="ml-4 p-2 text-gray-500 hover:text-gray-700 absolute right-2"
                    >
                        <Info size={20} />
                    </button>
                )}
                <PaymentSuccessPopup 
                    isOpen={showPopup} 
                    onClose={() => setShowPopup(false)}
                    title="Travel-Rizz Features"
                    description="Here are a range of features to help you plan your trip effectively:"
                />
            </StepsList>
        </StepsRoot>
    );
};

export default StageProgress;