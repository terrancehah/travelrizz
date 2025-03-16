// Utility for managing Google Maps script loading and configuration
const GOOGLE_MAPS_CONFIG = {
    version: 'weekly',  // Changed to weekly for latest updates
    libraries: ['places', 'marker', 'geometry'],
    mapIds: {
        light: '32620e6bdcb7e236',
        dark: '61462f35959f2552'
    }
};

let scriptPromise: Promise<void> | null = null;

// Import Place type for marker management
import { Place } from '../managers/types';

// Interface for marker customization options
interface MarkerOptions {
    color?: string;
    dayIndex?: number;
    orderIndex?: number;
}

// Interface for info window configuration
interface InfoWindowOptions {
    maxWidth?: number;
    pixelOffset?: google.maps.Size;
}

// Colors for different days in the itinerary
const ROUTE_COLORS = [
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#795548', // Brown
    '#FF9800', // Orange
    '#009688', // Teal
    '#E91E63', // Pink
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#00BCD4', // Cyan
    '#4CAF50'  // Green
];

// Default marker styles
const DEFAULT_MARKER_STYLES = {
    background: "#FF4444",  // Bright red
    borderColor: "#CC0000", // Darker red border
    glyphColor: "#FFFFFF",  // White glyph
};

function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return `#${(1 << 24 | (R < 0 ? 0 : R) << 16 | (G < 0 ? 0 : G) << 8 | (B < 0 ? 0 : B)).toString(16).slice(1)}`;
}

// Class to manage Google Maps markers and related operations
export class GoogleMapManager {
    private markers: Map<string, google.maps.marker.AdvancedMarkerElement>;
    private map: google.maps.Map;
    private infoWindow: google.maps.InfoWindow;
    private apiKey: string;

    constructor(map: google.maps.Map, apiKey: string) {
        this.markers = new Map();
        this.map = map;
        this.apiKey = apiKey;
        this.infoWindow = new google.maps.InfoWindow({
            maxWidth: 300,
            pixelOffset: new google.maps.Size(0, -30)
        });
    }

    // Create and configure a new marker for a place
    async createMarker(place: Place, options?: MarkerOptions) {
        try {
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
            
            const markerId = place.id;

            const pinElement = new PinElement({
                background: DEFAULT_MARKER_STYLES.background,
                borderColor: DEFAULT_MARKER_STYLES.borderColor,
                glyphColor: DEFAULT_MARKER_STYLES.glyphColor,
                glyph: options?.orderIndex != null ? `${options.orderIndex + 1}` : undefined
            });

            const marker = new AdvancedMarkerElement({
                position: {
                    lat: place.location!.latitude,
                    lng: place.location!.longitude
                },
                title: typeof place.displayName === 'string' ? place.displayName : place.displayName.text,
                content: pinElement.element,
                gmpDraggable: false,
            });

            // Add click listener
            marker.addListener('click', () => {
                this.showInfoWindow(place, marker);
            });

            // Set marker on map and store reference
            marker.map = this.map;
            this.markers.set(markerId, marker);

            return marker;
        } catch (error) {
            console.error('[GoogleMapManager] Error creating marker:', error);
            return null;
        }
    }

    // Remove a marker and clean up its resources
    removeMarker(markerId: string) {
        const marker = this.markers.get(markerId);
        if (marker) {
            marker.map = null;
            google.maps.event.clearInstanceListeners(marker);
            this.markers.delete(markerId);
            
            // Close info window if it's open for this marker
            if (this.infoWindow) {
                this.infoWindow.close();
            }
        }
    }

    // Update an existing marker's properties
    updateMarker(markerId: string, options: MarkerOptions) {
        const marker = this.markers.get(markerId);
        if (!marker) return;

        const dayIndex = options.dayIndex ?? 0;
        const color = ROUTE_COLORS[dayIndex % ROUTE_COLORS.length];

        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: darkenColor(color, 40), // 40% darker
            glyphColor: "#FFFFFF", //white
            glyph: options.orderIndex != null ? `${options.orderIndex + 1}` : undefined
        });

        marker.content = pinElement.element;
    }

    // Remove all markers from the map
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.map = null;
            google.maps.event.clearInstanceListeners(marker);
        });
        this.markers.clear();
        this.infoWindow.close();
    }

    // Create and display info window content for a place
    private createInfoWindowContent(place: Place): string {
        const photoUrl = place.photos && place.photos[0] 
            ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=200&maxWidthPx=300&key=${this.apiKey}`
            : '';

        const placeTitle = typeof place.displayName === 'string' ? place.displayName : place.displayName.text;

        return `
            <div class="bg-white rounded-lg shadow-sm" style="max-width: 300px;">
                ${photoUrl ? `
                    <div style="height: 150px; width: 100%;">
                        <img src="${photoUrl}" 
                            alt="${placeTitle}"
                            style="width: 100%; height: 100%; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;"
                        />
                    </div>
                ` : ''}

                <div class="p-3">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">
                            ${placeTitle}
                        </h3>
                    </div>
                    ${place.primaryTypeDisplayName 
                        ? `<div class="text-sm text-gray-600 mb-1">${place.primaryTypeDisplayName.text}</div>`
                        : ''}
                    ${place.formattedAddress 
                        ? `<p class="text-sm text-gray-500">${place.formattedAddress}</p>`
                        : ''}
                </div>
            </div>
        `;
    }

    // Display info window for a place
    showInfoWindow(place: Place, marker: google.maps.marker.AdvancedMarkerElement) {
        const content = this.createInfoWindowContent(place);
        this.infoWindow.setContent(content);
        this.infoWindow.open({
            map: this.map,
            anchor: marker
        });
    }

    // Get a marker by its ID
    getMarker(markerId: string) {
        return this.markers.get(markerId);
    }

    // Get all markers
    getMarkers() {
        return Array.from(this.markers.values());
    }
}

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
