import { TravelDetails, TravelSession } from './types';
import { getStoredSession, initializeSession } from '../managers/session-manager';

// Define requirements for each stage
interface StageRequirements {
    validate: (
        travelDetails: TravelDetails,
        session: TravelSession
    ) => {
        isValid: boolean;
        missingRequirements: string[];
        upgradeRequired?: boolean;
    };
}

const STAGE_VALIDATORS: Record<number, StageRequirements> = {
    // Stage 1: Initial Parameter Check
    1: {
        validate: (details: TravelDetails, session: TravelSession) => {
            const missingRequirements: string[] = [];
            
            if (!details.destination) missingRequirements.push('destination');
            if (!details.startDate) missingRequirements.push('start date');
            if (!details.endDate) missingRequirements.push('end date');
            if (!details.preferences?.length) missingRequirements.push('preferences');
            if (!details.language) missingRequirements.push('language');
            
            return {
                isValid: missingRequirements.length === 0,
                missingRequirements
            };
        }
    },
    
    // Stage 2: City Introduction
    2: {
        validate: (details: TravelDetails, session: TravelSession) => {
            return {
                isValid: true,
                missingRequirements: []
            };
        }
    },
    
    // Stage 3: Places Introduction
    3: {
        validate: (details: TravelDetails, session: TravelSession) => {
            const isValid = session.isPaid;
            const upgradeRequired = !session.isPaid;
            const missingRequirements = session.isPaid ? [] : ['premium subscription'];
            
            return {
                isValid,
                missingRequirements,
                upgradeRequired
            };
        }
    },
    
    // Stage 4: Itinerary Review (with payment check)
    4: {
        validate: (details: TravelDetails, session: TravelSession) => {
            const { isPaid } = session;
            const missingRequirements: string[] = [];
            
            // Check payment status
            if (!isPaid) {
                missingRequirements.push('premium subscription');
            }
            
            return {
                isValid: missingRequirements.length === 0,
                missingRequirements,
                upgradeRequired: !isPaid
            };
        }
    },
    
    // Stage 5: Final Confirmation (keeping it open as requested)
    5: {
        validate: (_, session: TravelSession) => {
            const isPaid = session.isPaid;
            return {
                isValid: isPaid,
                missingRequirements: isPaid ? [] : ['premium subscription'],
                upgradeRequired: !isPaid
            };
        }
    }
};

// Main validation function to be used in the chat component
export function validateStageProgression(
    currentStage: number,
    nextStage: number,
    travelDetails: TravelDetails
): {
    canProgress: boolean;
    missingRequirements: string[];
    upgradeRequired?: boolean;
} {
    let session = getStoredSession();
    
    // If no session exists but we have travel details, initialize one
    if (!session && travelDetails.destination) {
        session = initializeSession();
        session.destination = travelDetails.destination;
        session.startDate = travelDetails.startDate || '';
        session.endDate = travelDetails.endDate || '';
        session.preferences = travelDetails.preferences || [];
        session.budget = travelDetails.budget || '';
        session.language = travelDetails.language || '';
        session.transport = travelDetails.transport || [];
        session.currentStage = currentStage;
    }
    
    if (!session) {
        return {
            canProgress: false,
            missingRequirements: ['valid session']
        };
    }
    
    // Ensure stage progression is sequential
    if (nextStage !== currentStage + 1) {
        return {
            canProgress: false,
            missingRequirements: ['invalid stage progression']
        };
    }
    
    // Get validator for current stage
    const validator = STAGE_VALIDATORS[currentStage];
    if (!validator) {
        return {
            canProgress: true,
            missingRequirements: []
        };
    }
    
    // Check if current stage requirements are met before progressing
    const { isValid, missingRequirements, upgradeRequired } = validator.validate(
        travelDetails,
        session
    );
    
    // If current stage requirements are met, allow progression
    if (isValid) {
        return {
            canProgress: true,
            missingRequirements: [],
            upgradeRequired
        };
    }
    
    return {
        canProgress: isValid,
        missingRequirements,
        upgradeRequired
    };
}
