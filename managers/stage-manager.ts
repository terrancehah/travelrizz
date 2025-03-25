import { TravelDetails } from './types';

interface StageRequirements {
    validate: (
        travelDetails: TravelDetails,
        isPaid?: boolean
    ) => {
        isValid: boolean;
        missingRequirements: string[];
        upgradeRequired?: boolean;
    };
}

const STAGE_VALIDATORS: Record<number, StageRequirements> = {
    1: {
        validate: (details: TravelDetails) => {
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
    2: {
        validate: (details: TravelDetails) => {
            return {
                isValid: true,
                missingRequirements: []
            };
        }
    },
    3: {
        validate: (details: TravelDetails, isPaid?: boolean) => {
            if (isPaid === undefined) {
                return { isValid: false, missingRequirements: ['payment status unknown'] };
            }
            const missingRequirements = isPaid ? [] : ['one time payment needed'];
            return {
                isValid: isPaid,
                missingRequirements,
                upgradeRequired: !isPaid
            };
        }
    },
    4: {
        validate: (details: TravelDetails, isPaid?: boolean) => {
            if (isPaid === undefined) {
                return { isValid: false, missingRequirements: ['payment status unknown'] };
            }
            const missingRequirements = isPaid ? [] : ['one time payment needed'];
            return {
                isValid: isPaid,
                missingRequirements,
                upgradeRequired: !isPaid
            };
        }
    },
    5: {
        validate: (details: TravelDetails, isPaid?: boolean) => {
            if (isPaid === undefined) {
                return { isValid: false, missingRequirements: ['payment status unknown'] };
            }
            const missingRequirements = isPaid ? [] : ['one time payment needed'];
            return {
                isValid: isPaid,
                missingRequirements,
                upgradeRequired: !isPaid
            };
        }
    }
};

export function validateStageProgression(
    currentStage: number,
    nextStage: number,
    travelDetails: TravelDetails,
    isPaid: boolean
): {
    canProgress: boolean;
    missingRequirements: string[];
    upgradeRequired?: boolean;
} {
    const validator = STAGE_VALIDATORS[currentStage];
    if (!validator) {
        return { canProgress: true, missingRequirements: [] };
    }

    const { isValid, missingRequirements, upgradeRequired } = validator.validate(
        travelDetails,
        [3, 4, 5].includes(currentStage) ? isPaid : undefined
    );

    return {
        canProgress: isValid,
        missingRequirements,
        upgradeRequired
    };
}