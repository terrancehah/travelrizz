import { useChat } from 'ai/react';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { TravelDetails, TravelSession, StageProgressResult } from '../managers/types';
import { Place } from '../managers/types';
import { savedPlacesManager } from '../managers/saved-places-manager';
import { validateStageProgression } from '../managers/stage-manager';
import { Message as LocalMessage, ToolInvocation } from '../managers/types';
import { Message as AiMessage } from 'ai';
import { checkSessionWithWarning, getStoredSession, SESSION_CONFIG, handleSessionExpiry, updateStoredMetrics, checkInputLimits } from '../managers/session-manager';
import { useRouter } from 'next/router';

interface ChatRequestBody {
    message: string;
    destination: string;
    messageCount: number;
    currentStage: number;
    metrics: TravelSession;
}

interface UseTravelChatProps {
    currentDetails: TravelDetails;
    savedPlaces: Place[];
    currentStage: number;
    metrics: TravelSession;
    onStageUpdate?: (nextStage: number) => void;
}

export function useTravelChat({
    currentDetails,
    savedPlaces: initialSavedPlaces,
    currentStage,
    metrics,
    onStageUpdate
}: UseTravelChatProps) {
    const quickResponseInProgress = useRef(false);
    const [showSessionWarning, setShowSessionWarning] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumModalState, setPremiumModalState] = useState(null);
    const router = useRouter();
    const chatId = router.query.session as string || SESSION_CONFIG.STORAGE_KEY;
    
    // Check if within stage limit
    const isWithinStageLimit = useMemo(() => {
        const { withinStageLimit } = checkInputLimits(currentStage);
        return withinStageLimit;
    }, [currentStage, metrics.isPaid, metrics.stagePrompts?.[currentStage]]);
    
    // // Premium stage check
    // const checkPremiumStage = useCallback(() => {
    //     if (currentStage === 3 && !metrics.isPaid && !isWithinStageLimit) {
    //         setShowPremiumModal(true);
    //         return false;
    //     }
    //     return true;
    // }, [currentStage, metrics.isPaid, isWithinStageLimit]);
    
    // Handle missing session
    useEffect(() => {
        if (!getStoredSession()) {
            router.push('/travel-form');
        }
    }, [router]);
    
    // Session check effect
    useEffect(() => {
        const checkSession = () => {
            const { isValid, shouldWarn } = checkSessionWithWarning();
            if (!isValid) {
                handleSessionExpiry();
                return;
            }
            if (shouldWarn) {
                setShowSessionWarning(true);
            }
            return isValid;
        };
        
        const interval = setInterval(checkSession, 60000);
        return () => clearInterval(interval);
    }, []);
    
    // Simply use savedPlacesManager directly
    const currentSavedPlaces = savedPlacesManager.getPlaces();
    
    useEffect(() => {
        const handlePlacesChanged = () => {
            // Force re-render when places change
        };
        
        window.addEventListener('savedPlacesChanged', handlePlacesChanged);
        return () => window.removeEventListener('savedPlacesChanged', handlePlacesChanged);
    }, []);
    
    // Define quickResponseChat first with original implementation
    const quickResponseChat = useChat({
        api: '/api/chat/quick-response',
        id: chatId,
        body: {
            currentDetails,
            currentStage,
            metrics
        },
        onFinish: (message) => {
            // Keep loading until we have valid responses
            const hasValidResponses = message?.toolInvocations?.some(
                t => t.toolName === 'quickResponse' && 
                t.state === 'result' && 
                t.result?.props?.responses?.length > 0
            );
            if (!hasValidResponses) {
                // console.log('[QuickResponse] No valid responses in finished message');
                quickResponseInProgress.current = false;
                return;
            }
            quickResponseInProgress.current = false;
        },
        onError: useCallback((error: Error) => {
            // console.error('[QuickResponse] Error:', error);
            quickResponseInProgress.current = false;
        }, []),
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        },
        streamProtocol: 'data'
    });
    
    const mainChat = useChat({
        api: '/api/chat',
        id: chatId,
        // experimental_throttle: 100, // Add 250ms throttle to reduce UI updates during streaming
        body: {
            currentDetails,
            destination: currentDetails.destination,
            savedPlaces: currentSavedPlaces
            ?.filter(place => place && place.id && place.displayName)
            ?.map(place => ({
                id: place.id,
                displayName: place.displayName,
                formattedAddress: place.formattedAddress,
                location: place.location,
                primaryType: place.primaryType,
                primaryTypeDisplayName: place.primaryTypeDisplayName?.text,
                photos: place.photos || [],
                regularOpeningHours: place.regularOpeningHours
            })) || [],
            currentStage,
            metrics: {
                ...metrics,
                destination: currentDetails.destination
            }
        },
        onError: useCallback((error: Error) => {
            console.error('[MainChat] Error:', error);
            if (error instanceof Error) {
                console.error('[MainChat] Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
            }
            quickResponseInProgress.current = false;
        }, []),
        onFinish: useCallback(async (message: AiMessage) => {
            
            if (message.role !== 'assistant' || !message.content?.trim()) {
                quickResponseInProgress.current = false;
                return;
            }
            
            if (quickResponseInProgress.current) return;
            
            quickResponseInProgress.current = true;

            // Add a small delay to ensure all operations are completed
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

            try {
                // console.log('[QuickResponse] Triggering append for message:', message.id);
                const responsePromise = quickResponseChat.append({
                    id: message.id,
                    content: message.content,
                    role: message.role
                });

                // Add a timeout to prevent indefinite hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Quick Response timeout')), 10000) // 10s timeout
                );

                await Promise.race([responsePromise, timeoutPromise]);
                // console.log('[QuickResponse] Append completed for message:', message.id);
            } catch (error) {
                console.error('[QuickResponse] Error:', error);
                quickResponseInProgress.current = false;
            }
        }, [quickResponseChat]),
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        },
        streamProtocol: 'data'
    });
    
    const quickResponses = useMemo(() => {
        const messages = quickResponseChat.messages;
        
        // Get last message regardless of count
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return [];
        
        function extractQuickResponses(message: AiMessage) {
            const quickResponseInvocation = message.toolInvocations?.find(
                t => t.toolName === 'quickResponse' && t.state === 'result'
            );
            
            if (!quickResponseInvocation || !('result' in quickResponseInvocation)) {
                // console.log('[QuickResponse] No valid responses found in API response');
                return [];
            }
            
            const responses = quickResponseInvocation.result.props.responses;
            if (responses.length > 0) {
                // console.log('[QuickResponse] Got valid responses:', responses);
                return responses;
            }
            
            // console.log('[QuickResponse] Empty responses array');
            return [];
        }
        
        return extractQuickResponses(lastMessage);
    }, [quickResponseChat.messages]);
    
    // Stage progression validation and handling
    const handleStageProgression = useCallback((nextStage: number): StageProgressResult => {
        if (nextStage === 4 && !metrics.isPaid) {
            setShowPremiumModal(true);
            return {
                type: 'stageProgress',
                status: 'error',
                props: {
                    nextStage: currentStage,
                    error: 'Premium required for advanced stages',
                    upgradeRequired: true
                }
            };
        }
        
        const { canProgress, missingRequirements, upgradeRequired } = validateStageProgression(
            currentStage,
            nextStage,
            currentDetails
        );
        
        if (canProgress) {
            console.log(`[Stage Progression] Moving to stage ${nextStage}`);
            
            if (upgradeRequired) {
                console.log('[Stage Progression] Upgrade required for stage progression');
            }
            
            if (onStageUpdate) {
                onStageUpdate(nextStage);
            }
            
            return {
                type: 'stageProgress',
                status: 'success',
                props: {
                    nextStage
                }
            };
        }
        
        return {
            type: 'stageProgress',
            status: 'error',
            props: {
                nextStage: currentStage,
                error: 'Stage requirements not met',
                upgradeRequired: upgradeRequired || false
            }
        };
    }, [currentStage, currentDetails, metrics.isPaid, onStageUpdate, setShowPremiumModal]);
    
    // Wrap append to include metrics update
    const append = useCallback(async (message: any, options?: any) => {
        // Only increment metrics for user messages and not system messages
        const shouldIncrement = message.role === 'user';
        const updatedMetrics = updateStoredMetrics(currentStage, shouldIncrement);
        
        // Append message with latest metrics
        await mainChat.append(message, {
            ...options,
            body: {
                ...options?.body,
                metrics: updatedMetrics
            }
        });
    }, [mainChat, currentStage]);
    
    return {
        ...mainChat,
        messages: mainChat.messages.map(msg => ({
            ...msg,
            role: msg.role === 'data' ? 'system' : msg.role
        })) as LocalMessage[],
        quickResponses,
        isQuickResponseLoading: quickResponseInProgress.current,
        handleStageProgression,
        showSessionWarning,
        setShowSessionWarning,
        isWithinStageLimit,
        showPremiumModal,
        setShowPremiumModal,
        premiumModalState,
        setPremiumModalState,
        // checkPremiumStage,
        append
    };
}