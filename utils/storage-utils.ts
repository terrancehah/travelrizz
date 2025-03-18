// This file holds tools for safely using browser storage
export const getStorage = () => {
    if (typeof window !== 'undefined') {
        return window.sessionStorage;
    }
    return null;
};

export const storage = getStorage();

export const safeStorageOp = <T>(operation: () => T, defaultValue: T): T => {
    try {
        if (!storage) return defaultValue;
        return operation();
    } catch (error) {
        console.error('[Storage] Operation failed:', error);
        return defaultValue;
    }
};