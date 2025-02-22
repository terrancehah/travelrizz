// Utility for managing Google Maps script loading and configuration
const GOOGLE_MAPS_CONFIG = {
    version: 'v3.47',
    libraries: ['places', 'marker', 'geometry'],
    mapIds: {
        light: '32620e6bdcb7e236',
        dark: '61462f35959f2552'
    }
};

let scriptPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    if (scriptPromise) return scriptPromise;
    
    if (window.google?.maps) {
        return Promise.resolve();
    }

    scriptPromise = new Promise((resolve, reject) => {
        try {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&v=${GOOGLE_MAPS_CONFIG.version}&map_ids=${GOOGLE_MAPS_CONFIG.mapIds.light},${GOOGLE_MAPS_CONFIG.mapIds.dark}`;
            script.async = true;
            script.defer = true;

            script.addEventListener('load', () => resolve());
            script.addEventListener('error', (e) => reject(e.error));

            document.head.appendChild(script);
        } catch (error) {
            reject(error);
        }
    });

    return scriptPromise;
};

export const getMapId = (theme: 'light' | 'dark' = 'light'): string => {
    return GOOGLE_MAPS_CONFIG.mapIds[theme];
};

export const isGoogleMapsLoaded = (): boolean => {
    return !!window.google?.maps;
};
