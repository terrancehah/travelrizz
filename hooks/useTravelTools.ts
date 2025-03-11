import { useState } from 'react';
import { TravelDetails, TravelSession } from '../managers/types';
import { Place } from '../managers/types';
import { savedPlacesManager } from '../managers/saved-places-manager';

import { getStoredSession, safeStorageOp, storage, SESSION_CONFIG } from '../managers/session-manager';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface UseTravelToolsProps {
  currentDetails: TravelDetails;
  setCurrentDetails: (details: TravelDetails) => void;
  currentStage: number;
  onStageUpdate: (nextStage: number) => void;
  userMetrics: TravelSession;
  append: (message: any, options?: any) => Promise<void>;
  savedPlaces: Place[];
}

export function useTravelTools({
  currentDetails,
  setCurrentDetails,
  currentStage,
  onStageUpdate,
  userMetrics,
  append,
  savedPlaces
}: UseTravelToolsProps) {
  const [toolVisibility, setToolVisibility] = useState<Record<string, boolean>>({});
  const t = useTranslations('parameters');
  const fonts = useLocalizedFont();

  // Helper function to update session storage
  const updateSessionDetails = (updates: Partial<TravelDetails>) => {
    const session = getStoredSession();
    if (session) {
      const updatedSession = {
        ...session,
        ...updates,
        lastActive: Date.now()
      };
      safeStorageOp(() => {
        storage?.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(updatedSession));
      }, undefined);
    }
  };

  const handleToolUpdate = async (message: any) => {
    console.log('[useTravelTools] Received tool invocations:', message.toolInvocations.map((t: { 
      toolName: string;
      toolCallId: string;
      result?: { 
        type?: string;
        props?: Record<string, any>;
      };
    }) => ({
      toolName: t.toolName,
      toolCallId: t.toolCallId,
      resultType: t.result?.type,
      resultProps: t.result?.props ? Object.keys(t.result.props) : []
    })));

    if (!message.toolInvocations?.[0]) return;

    const toolInvocation = message.toolInvocations[0];
    const { toolCallId, result, toolName } = toolInvocation;

    if (!result) return;

    console.log('[useTravelTools] Processing tool:', {
      toolName,
      toolCallId,
      resultType: result.type,
      props: result.props
    });

    // Handle different tool types
    switch (result.type) {

      case 'budgetSelector':
        // Only show selector, don't update anything yet
        if (!result.props?.currentBudget) {
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: true
            }));
          }
          return;
        }
        // Update only when user has made a selection
        if (result.props.currentBudget) {
          const updates = { budget: result.props.currentBudget };
          setCurrentDetails({ ...currentDetails, ...updates });
          updateSessionDetails(updates);
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: false
            }));
          }
          await append({
            role: 'user',
            content: t('budget.confirmationmessage', {
              budget: result.props.currentBudget
            })
          });
        }
        break;

      case 'preferenceSelector':
        // Only show selector, don't update anything yet
        if (!result.props?.currentPreferences) {
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: true
            }));
          }
          return;
        }
        // Update only when user has made a selection
        if (result.props.currentPreferences) {
          const updates = { preferences: result.props.currentPreferences };
          setCurrentDetails({ ...currentDetails, ...updates });
          updateSessionDetails(updates);
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: false
            }));
          }
          await append({
            role: 'user',
            content: t('preferences.confirmationmessage', {
              preferences: result.props.currentPreferences.join(', ')
            })
          });
        }
        break;

      case 'datePicker':
        // Only show selector, don't update anything yet
        if (!result.props?.startDate || !result.props?.endDate) {
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: true
            }));
          }
          return;
        }
        // Update only when user has made a selection
        if (result.props.startDate && result.props.endDate) {
          const updates = {
            startDate: result.props.startDate,
            endDate: result.props.endDate
          };
          setCurrentDetails({ ...currentDetails, ...updates });
          updateSessionDetails(updates);
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: false
            }));
          }
          await append({
            role: 'user',
            content: t('dates.confirmationmessage', { 
              startDate: result.props.startDate, 
              endDate: result.props.endDate 
            })
          });
        }
        break;

      case 'languageSelector':
        // Only show selector, don't update anything yet
        if (!result.props?.currentLanguage) {
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: true
            }));
          }
          return;
        }
        // Update only when user has made a selection
        if (result.props.currentLanguage) {
          const updates = { language: result.props.currentLanguage };
          setCurrentDetails({ ...currentDetails, ...updates });
          updateSessionDetails(updates);
          if (toolCallId) {
            setToolVisibility(prev => ({
              ...prev,
              [toolCallId]: false
            }));
          }
          await append({
            role: 'user',
            content: t('language.confirmationmessage', { language: result.props.currentLanguage })
          });
        }
        break;

      case 'stageProgress':
        if (result.props?.nextStage) {
          onStageUpdate(result.props.nextStage);
        }
        break;

      case 'placeOptimizer':
        console.log('[useTravelTools] Entering placeOptimizer case:', {
          resultType: result.type,
          hasProps: !!result.props,
          propsKeys: result.props ? Object.keys(result.props) : [],
          rawResult: result
        });
        
        // Handle place optimizer responses with optimizedPlaces
        if (result.props?.optimizedPlaces && Array.isArray(result.props.optimizedPlaces)) {
          console.log('[useTravelTools] Received optimized places with dayIndex/orderIndex:', 
            result.props.optimizedPlaces.map((p: Place) => ({
              id: p.id,
              name: typeof p.displayName === 'string' ? p.displayName : p.displayName?.text,
              dayIndex: p.dayIndex,
              orderIndex: p.orderIndex
            }))
          );
          
          // Update the places with their new indices
          await savedPlacesManager.updatePlacesWithIndices(result.props.optimizedPlaces);
          console.log('[useTravelTools] Updated saved places with optimized arrangement:', 
            result.props.optimizedPlaces.map((p: Place) => ({
              id: p.id,
              name: typeof p.displayName === 'string' ? p.displayName : p.displayName?.text,
              dayIndex: p.dayIndex,
              orderIndex: p.orderIndex
            })));
        } else {
          console.log('[useTravelTools] Invalid or missing optimizedPlaces in result:', {
            hasOptimizedPlaces: !!result.props?.optimizedPlaces,
            isArray: Array.isArray(result.props?.optimizedPlaces),
            optimizedPlacesType: typeof result.props?.optimizedPlaces
          });
        }
        break;

      case 'savedPlacesList':
      case 'quickResponse':
        // Keep these tools visible
        if (toolCallId) {
          setToolVisibility(prev => ({
            ...prev,
            [toolCallId]: true
          }));
        }
        break;
    }
  };

  return {
    toolVisibility,
    setToolVisibility,
    handleToolUpdate
  };
}
