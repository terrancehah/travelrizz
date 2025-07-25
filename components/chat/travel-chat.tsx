// components/travel-chat.tsx

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { BudgetLevel, SupportedLanguage, TravelDetails, TravelPreference, WeatherForecastProps, WeatherHistoricalProps } from '../../managers/types';
import { BudgetSelector } from '../selectors/budget-selector';
import { PreferenceSelector } from '../selectors/preference-selector';
import { DatePicker } from '../selectors/date-selector';
import { LanguageSelector } from '../selectors/language-selector';
import { PlaceCard } from '../features/places/place-card';
import { PlaceCarousel } from '../features/places/place-carousel';
import { SavedPlacesList } from '../features/places/saved-places-list';
import HistoricalWeatherChart from '../features/weather/weather-historical';
import WeatherForecast from '../features/weather/weather-forecast';
import { OptimizedItinerary } from '../features/places/optimized-itinerary';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { QuickResponse } from './quick-response';
import ReactMarkdown from 'react-markdown';
import { validateStageProgression } from '../../managers/stage-manager';
import { TravelSession, StageProgressResult } from '../../managers/types';
import { CurrencyConverter } from '../features/currency/currency-converter';
import { useTravelChat } from '../../hooks/useTravelChat';
import { useTravelTools } from '../../hooks/useTravelTools';
import { Place } from '../../managers/types';
import { searchPlaceByText } from '../../utils/places-utils';
import { savedPlacesManager } from '../../managers/saved-places-manager';
import { ToolInvocation } from '../../managers/types';
import { getStoredSession, checkInputLimits, handleSessionExpiry, checkSessionWithWarning, updateStoredMetrics } from '../../managers/session-manager';
import PremiumUpgradeModal from '../modals/premium-upgrade-modal';
import SessionWarningModal from '../modals/session-warning-modal';
import { useRouter } from 'next/router';
import { ChatHeader } from './chat-header';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import { useTranslations } from 'next-intl';
import LocalTips from '../features/local-tips/local-tips';

interface TravelChatProps {
    initialDetails: TravelDetails;
    onPlaceRemoved: (placeId: string) => void;
    currentStage: number;
    onStageUpdate: (nextStage: number) => void;
}

export function TravelChat({ 
    initialDetails, 
    onPlaceRemoved, 
    currentStage,
    onStageUpdate 
}: TravelChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [currentDetails, setCurrentDetails] = useState<TravelDetails>(initialDetails);
    const fonts = useLocalizedFont();
    const router = useRouter();
    const [sessionMetadata, setSessionMetadata] = useState<TravelSession | null>(() => getStoredSession());
    const t = useTranslations('travelChat');
    const tParam = useTranslations('parameters');

    // Callback to refresh session data after payment
    const refreshSession = useCallback(() => {
        const updatedSession = getStoredSession();
        setSessionMetadata(updatedSession);
    }, []);

    // Handle missing session
    useEffect(() => {
        if (!sessionMetadata) {
            router.push('/travel-form');
        }
    }, [sessionMetadata, router]);

    // Return early if no session
    if (!sessionMetadata) {
        return null;
    }

    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        const handlePlacesChanged = (event: Event) => {
            if (!(event instanceof CustomEvent)) return;
            
            // Safely get count from event detail or fallback to savedPlacesManager
            const count = event.detail?.count ?? savedPlacesManager.places.size;
            
            // console.log('[TravelChat] Places changed:', { 
            //     count,
            //     fromEvent: event.detail,
            //     fromManager: savedPlacesManager.places.size 
            // });
            
            setCurrentDetails(prev => ({
                ...prev,
                savedPlacesCount: count
            }));
        };

        // Listen for changes
        window.addEventListener('savedPlacesChanged', handlePlacesChanged);

        // Initial load
        const initialCount = savedPlacesManager.places.size;
        console.log('[TravelChat] Initial places load count:', initialCount);
        
        setCurrentDetails(prev => ({
            ...prev,
            savedPlacesCount: initialCount
        }));

        return () => {
            window.removeEventListener('savedPlacesChanged', handlePlacesChanged);
        };
    }, []);

    const {
        messages,
        isLoading,
        append,
        reload,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        stop,
        quickResponses,
        isQuickResponseLoading,
        showSessionWarning,
        setShowSessionWarning,
        isWithinStageLimit,
        showPremiumModal,
        setShowPremiumModal,
        handlePaymentSuccess
    } = useTravelChat({
        currentDetails,
        currentStage,
        savedPlaces: savedPlacesManager.getPlaces(),
        metrics: sessionMetadata
    });

    const {
        toolVisibility,
        setToolVisibility,
        handleToolUpdate
    } = useTravelTools({
        currentDetails,
        setCurrentDetails,
        currentStage,
        onStageUpdate,
        append,
        savedPlaces: savedPlacesManager.getPlaces(),
        userMetrics: sessionMetadata
    });

    // Add ref to track processed messages
    const processedMessages = useRef(new Set<string>());

    // Extract quick response options
    const getQuickResponseOptions = useCallback(() => {
        return quickResponses || [];
    }, [quickResponses]);

   // Function to check if quick responses should be shown
    const shouldShowQuickResponses = useCallback(() => {
        // Don't show quick responses if any parameter component is active
        const hasActiveParameterComponent = messages.some(message => 
            message.toolInvocations?.some(t => {
                const isParameter = ['budgetSelector', 'preferenceSelector', 'datePicker', 'languageSelector'].includes(t.toolName);
                const isVisible = toolVisibility[t.toolCallId];
                
                // console.log('Tool Check:', {
                //     toolName: t.toolName,
                //     toolCallId: t.toolCallId,
                //     isParameter,
                //     isVisible,
                //     toolVisibility
                // });
                
                return isParameter && isVisible;
            })
        );
        
        // console.log('Quick Response Check:', {
        //     hasActiveParameterComponent,
        //     isLoading,
        //     quickResponsesLength: quickResponses?.length,
        //     isQuickResponseLoading,
        //     messages: messages.map(m => ({
        //         role: m.role,
        //         toolInvocations: m.toolInvocations?.map(t => ({
        //             toolName: t.toolName,
        //             toolCallId: t.toolCallId
        //         }))
        //     }))
        // });

        if (hasActiveParameterComponent) {
            // console.log('[QuickResponse] Hidden due to active parameter component');
            return false;
        }

        // Show quick responses if we have valid options
        return !isLoading && (quickResponses?.length > 0 || isQuickResponseLoading);
    }, [messages, toolVisibility, quickResponses, isLoading, isQuickResponseLoading]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initialMessageSent = useRef(false);

    // Modified initial load effect
    useEffect(() => {
        if (!initialMessageSent.current && messages.length === 0) {
            initialMessageSent.current = true;
            const body = {
                currentDetails,
                savedPlaces: savedPlacesManager.getPlaces(),
                currentStage
            };
            
            append({
                role: 'user',
                content: t('chatMessages.initialPrompt', {
                    destination: currentDetails.destination,
                    startDate: currentDetails.startDate,
                    endDate: currentDetails.endDate
                }),
            }, { body });
        }
    }, [currentDetails, currentStage]);

    // Set new tool invocations to visible
    useEffect(() => {
        const newToolVisibility: Record<string, boolean> = {};
        const selectorTools = ['budgetSelector', 'preferenceSelector', 'datePicker', 'languageSelector'];
        
        messages.forEach(message => {
            message.toolInvocations?.forEach(tool => {
                if (!(tool.toolCallId in toolVisibility)) {
                    // For selector tools, check if they've been used
                    if (selectorTools.includes(tool.toolName)) {
                        const hasBeenUsed = tool.result?.props && (
                            'currentBudget' in (tool.result.props || {}) ||
                            'currentPreferences' in (tool.result.props || {}) ||
                            ('startDate' in (tool.result.props || {}) && 'endDate' in (tool.result.props || {})) ||
                            'currentLanguage' in (tool.result.props || {})
                        );
                        if (!hasBeenUsed) {
                            newToolVisibility[tool.toolCallId] = true;
                        }
                    } else {
                        // Non-selector tools should always be visible
                        newToolVisibility[tool.toolCallId] = true;
                    }
                }
            });
        });
        
        if (Object.keys(newToolVisibility).length > 0) {
            setToolVisibility(prev => ({
                ...prev,
                ...newToolVisibility
            }));
        }
    }, [messages]);

    // Add stage progression handling
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach((toolInvocation) => {
                if (toolInvocation.toolName === 'stageProgress' && 'result' in toolInvocation) {
                    const result = toolInvocation.result as StageProgressResult;
                    
                    if (result.status === 'success') {
                        onStageUpdate(result.props.nextStage);
                    } else if (result.status === 'error' && result.props.upgradeRequired && !sessionMetadata.isPaid) {
                        setShowPremiumModal(true);
                    }
                }
            });
        }
    }, [messages, onStageUpdate, currentStage, sessionMetadata.isPaid]);

    // Function to handle quick response selection
    const handleQuickResponseSelect = async (text: string) => {
        try {
            // Check for stage 3 prompt limit
            if (currentStage === 3 && !sessionMetadata.isPaid && !isWithinStageLimit) {
                setShowPremiumModal(true);
                return;
            }

            // Send the response to chat
            const body = {
                message: text,
                currentDetails,
                destination: currentDetails.destination,
                messageCount: messages.length,
                currentStage,
                metrics: sessionMetadata
            };
            
            await append({
                role: 'user',
                content: text
            }, { body });
        } catch (error) {
            console.error('[handleQuickResponseSelect] Error:', error);
        }
    };

    // We need to wrap handleSubmit to include our body data
    const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>, text?: string) => {
        e?.preventDefault();
        if (!input && !text) return;

        const messageText = text || input;
        // Clear input immediately before sending
        setInput('');

        try {
            // Prepare body with latest state
            const body = {
                currentDetails,
                savedPlaces: savedPlacesManager.getPlaces(),
                currentStage,
                metrics: sessionMetadata
            };
            
            // console.log('[handleMessageSubmit] Sending message with body:', body);
            
            // Send message to main chat
            await append({
                role: 'user',
                content: messageText
            }, { body });
        } catch (error) {
            console.error('[handleMessageSubmit] Error:', error);
            console.error('[handleMessageSubmit] Current state:', {
                currentDetails,
                savedPlacesCount: savedPlacesManager.getPlaces().length,
                currentStage,
                metrics: sessionMetadata
            });
        }
    };

    const mainChat = useTravelChat({
        currentDetails,
        currentStage,
        savedPlaces: savedPlacesManager.getPlaces(),
        metrics: sessionMetadata
    });

    useEffect(() => {
        const handleFinish = async (message: any) => {
            // Process message here
        };

        // Check if last message exists and process it
        const lastMessage = mainChat.messages[mainChat.messages.length - 1];
        if (lastMessage) {
            handleFinish(lastMessage).catch(console.error);
        }
    }, [mainChat, currentDetails, currentStage, onStageUpdate]);

    // Handle payment success
    const handlePaymentComplete = useCallback(async () => {
        refreshSession();
        await handlePaymentSuccess();
    }, [refreshSession, handlePaymentSuccess]);

    return (
        <div className="relative flex flex-col h-full shadow-lg">
            <PremiumUpgradeModal 
                isOpen={showPremiumModal} 
                onClose={() => setShowPremiumModal(false)}
                onPaymentSuccess={handlePaymentComplete}
            />
            <SessionWarningModal 
                isOpen={showSessionWarning}
                onClose={() => setShowSessionWarning(false)}
            />

            {/* Chat Messages Container */}
            <div 
                ref={chatContainerRef}
                className={`flex flex-col overflow-y-auto bg-white dark:bg-gray-800 transition-all duration-400 ease-in-out h-full`}
            >
                {/* Chat Header */}
                <div className="sticky top-0 z-10 w-full">
                    <ChatHeader
                        currentDetails={currentDetails}
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                    />
                </div>

                {/* Message content */}
                {messages.map((message, index) => (
                    <div key={index} className="w-full flex flex-col my-2">
                        {message.content && (
                            <div key={`content-${message.id || index}`} className={`flex ${message.role === 'user' ? 'justify-end mr-4' : 'justify-start ml-4'}`}>
                                <div className={`${
                                    message.role === 'user' 
                                        ? 'bg-blue-600/75 dark:bg-blue-600 text-white rounded-br-none min-w-[20%] w-fit max-w-[60%]' 
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none min-w-[20%] w-fit max-w-[75%]'
                                } rounded-2xl px-4 py-2`}>
                                    <ReactMarkdown 
                                        className={`prose max-w-none ${fonts?.text}`}
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-lg font-bold" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-base font-semibold" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-sm font-medium" {...props} />,
                                            p: ({node, ...props}) => <p className="text-sm" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-1" {...props} />,
                                            li: ({node, ...props}) => <li className="text-sm mb-0.5" {...props} />,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {message.toolInvocations?.map((toolInvocation, index) => {
                            const { toolName, toolCallId, state } = toolInvocation;

                            // Only render if the tool is visible in toolVisibility state
                            if (!toolVisibility[toolCallId]) return null;

                            if (state === 'result') {
                                switch (toolName) {
                                    case 'budgetSelector':
                                        if(!toolInvocation.result?.props) return null;
                                        const budgetProps = toolInvocation.result.props as { currentBudget: BudgetLevel };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <BudgetSelector 
                                                        currentBudget={budgetProps.currentBudget}
                                                        onUpdate={(budget) => {
                                                            const result = {
                                                                type: 'budgetSelector',
                                                                props: { currentBudget: budget }
                                                            };
                                                            handleToolUpdate({ 
                                                                toolInvocations: [{
                                                                    toolCallId,
                                                                    toolName,
                                                                    result
                                                                }]
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'preferenceSelector':
                                        if(!toolInvocation.result?.props) return null;
                                        const prefProps = toolInvocation.result.props as { currentPreferences: TravelPreference[] };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    {toolVisibility[toolCallId] && (
                                                        <PreferenceSelector 
                                                            currentPreferences={prefProps.currentPreferences}
                                                            onUpdate={(preferences) => {
                                                                const result = {
                                                                    type: 'preferenceSelector',
                                                                    props: { currentPreferences: preferences }
                                                                };
                                                                handleToolUpdate({ 
                                                                    toolInvocations: [{
                                                                        toolCallId,
                                                                        toolName,
                                                                        result
                                                                    }]
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );

                                    case 'datePicker':
                                        if(!toolInvocation.result?.props) return null;
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <DatePicker 
                                                        dates={{
                                                            startDate: currentDetails.startDate || '',
                                                            endDate: currentDetails.endDate || ''
                                                        }}
                                                        onUpdate={(dates) => {
                                                            const result = {
                                                                type: 'datePicker',
                                                                props: dates
                                                            };
                                                            handleToolUpdate({ 
                                                                toolInvocations: [{
                                                                    toolCallId,
                                                                    toolName,
                                                                    result
                                                                }]
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'languageSelector':
                                        if(!toolInvocation.result?.props) return null;
                                        const langProps = toolInvocation.result.props as { currentLanguage: SupportedLanguage };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <LanguageSelector 
                                                        currentLanguage={langProps.currentLanguage}
                                                        onUpdate={(language) => {
                                                            const result = {
                                                                type: 'languageSelector',
                                                                props: { currentLanguage: language }
                                                            };
                                                            handleToolUpdate({ 
                                                                toolInvocations: [{
                                                                    toolCallId,
                                                                    toolName,
                                                                    result
                                                                }]
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'placeCard':
                                        if(!toolInvocation.result?.props?.place) return null;
                                        const placeProps = toolInvocation.result.props as { place: Place };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-[80%] md:w-[60%] mt-4 mx-auto">
                                                    {placeProps.place && mainChat.status === 'ready' && (
                                                        <PlaceCard
                                                            place={placeProps.place}
                                                            showActions={false}
                                                            onSelect={() => {}}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );

                                    case 'placeCarousel':
                                        if(!toolInvocation.result?.props?.places) return null;
                                        const placeCarouselProps = toolInvocation.result.props as { places: Place[] };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    {placeCarouselProps.places.length > 0 && mainChat.status === 'ready' && (
                                                        <PlaceCarousel 
                                                            places={placeCarouselProps.places}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );

                                    case 'weatherHistorical':
                                        if(!toolInvocation.result?.props) return null;
                                        const weatherProps = toolInvocation.result.props as unknown as WeatherHistoricalProps;
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <HistoricalWeatherChart 
                                                        {...weatherProps}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'weatherForecast':
                                        if (!toolInvocation.result?.props) return null;
                                        const forecastProps = toolInvocation.result.props as unknown as WeatherForecastProps;
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <WeatherForecast 
                                                        {...forecastProps}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'currencyConverter':
                                        if (!toolInvocation.result?.props) return null;
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <CurrencyConverter 
                                                        {...toolInvocation.result.props as any}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    case 'savedPlacesList':
                                        if (!toolInvocation.result?.props) return null;
                                        const listProps = toolInvocation.result.props as unknown as { places: Place[] };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    {listProps.places.length > 0 && mainChat.status === 'ready' && (
                                                        <SavedPlacesList
                                                            onRemove={onPlaceRemoved}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );

                                    case 'localTips':
                                        if (!toolInvocation.result?.props) return null;
                                        const localTipsProps = toolInvocation.result.props as { destination: string; tips: { summary: string; description: string; }[] };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <LocalTips {...localTipsProps} />
                                                </div>
                                            </div>
                                        );

                                    case 'placeOptimizer':
                                        if (!toolInvocation.result?.props?.optimizedPlaces) return null;
                                        const { optimizedPlaces, startDate, endDate } = toolInvocation.result.props as {
                                            optimizedPlaces: Place[];
                                            startDate: string;
                                            endDate: string;
                                        };
                                        return (
                                            <div key={`${toolCallId}-${index}`} className="flex justify-start">
                                                <div className="w-full">
                                                    <OptimizedItinerary
                                                        places={optimizedPlaces}
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        onAccept={() => {
                                                            const result = { type: 'placeOptimizer', props: { optimizedPlaces } };
                                                            handleToolUpdate({ toolInvocations: [{ toolCallId, toolName, result }] });
                                                        }}
                                                        onReject={() => {
                                                            // Optionally log rejection or reset state
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );

                                    default:
                                        return null;
                                }
                            } else {
                                return (

                                    // AI Response Component Loading Placeholder
                                    <div key={`${toolCallId}-${index}`} className="flex justify-star ml-4 my-2">
                                        <div className="relative overflow-hidden min-w-[200px] 
                                        before:absolute before:inset-0 before:z-0 before:bg-gradient-to-r 
                                        before:from-blue-400 before:via-purple-500 before:to-orange-500 
                                        before:animate-gradient-x before:bg-[length:200%_100%] after:absolute after:inset-0 
                                        after:bg-white after:opacity-70 after:z-[1] shadow-sm
                                        text-secondary rounded-2xl rounded-bl-none px-4 py-1.5 max-w-[75%]">
                                            <div className="relative z-[2]">
                                                <span className="inline-flex items-center gap-1 text-sky-blue">
                                                    <span className={`text-sm ${fonts.text} font-semibold`}>{t('chatUI.thinking')}</span>
                                                    <span className="animate-[pulse_1.2s_ease-in-out_infinite]">.</span>
                                                    <span className="animate-[pulse_1.2s_ease-in-out_infinite_400ms]">.</span>
                                                    <span className="animate-[pulse_1.2s_ease-in-out_infinite_800ms]">.</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                );
                            }
                        })}
                        
                        {isLoading && message.id === messages[messages.length - 1].id && (
                            // AI Response Message Loading Placeholder
                            <div key={`loading-${message.id}`} className="flex justify-start ml-4 my-2">
                                <div className="relative overflow-hidden min-w-[200px] 
                                        before:absolute before:inset-0 before:z-0 before:bg-gradient-to-r 
                                        before:from-blue-600 before:via-purple-700 before:to-orange-500
                                        before:animate-gradient-x before:bg-[length:200%_100%] after:absolute after:inset-0 
                                        after:bg-white after:opacity-70 after:z-[1] animate-subtle-breathing-halo-500
                                        text-secondary rounded-2xl rounded-bl-none px-4 py-1.5 max-w-[75%]">
                                    <div className="relative z-[2]">
                                        <span className="inline-flex items-center gap-1 text-sky-blue">
                                            <span className={`text-sm ${fonts.text} font-semibold`}>{t('chatUI.thinking')}</span>
                                            <span className="animate-[pulse_1.2s_ease-in-out_infinite]">.</span>
                                            <span className="animate-[pulse_1.2s_ease-in-out_infinite_400ms]">.</span>
                                            <span className="animate-[pulse_1.2s_ease-in-out_infinite_800ms]">.</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />

                 {/* Quick responses section - below the chat container */}
                <div className="sticky bottom-0 z-10">
                    {shouldShowQuickResponses() && (
                        <QuickResponse 
                            responses={getQuickResponseOptions()}
                            onResponseSelect={handleQuickResponseSelect}
                            isLoading={isQuickResponseLoading}
                        />
                    )}
                </div>

            </div>

            {/* Chat Input Container */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:mb-0  bg-light-blue/60 dark:bg-gray-900 transition-colors duration-400">
                <form onSubmit={handleMessageSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder={t('chatUI.inputPlaceholder')}
                        className={`${fonts.text} flex-1 rounded-xl px-4 py-2 bg-white dark:bg-gray-800
                            border-2 border-gray-200 dark:border-gray-600  focus:border-blue-500 dark:focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        disabled={isLoading || (currentStage === 3 && !sessionMetadata.isPaid && !isWithinStageLimit)}
                    />
                    {/* {isLoading && (
                        <button
                            onClick={stop}
                            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Stop
                        </button>
                    )} */}
                    <button
                        type="submit"
                        disabled={isLoading || (currentStage === 3 && !sessionMetadata.isPaid && !isWithinStageLimit)}
                        className={`${fonts.text} inline-flex items-center rounded-xl bg-blue-600/75 dark:bg-blue-800 hover:bg-blue-600 px-4 py-2 
                            text-sm font-semibold text-white dark:text-gray-200 dark:hover:text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                    >
                        {t('chatUI.send')}
                    </button>
                    
                </form>
            </div>

        </div>
    );
};

export default TravelChat;

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: {
                travelChat: (await import(`/public/locales/${locale}/travel-chat.json`)).default,
                parameters: (await import(`/public/locales/${locale}/parameters.json`)).default
            },
            locale
        }
    }
}