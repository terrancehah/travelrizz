import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Place } from '@/managers/types';
import { searchPlaceByText } from '@/utils/places-utils';
import { savedPlacesManager } from '@/managers/saved-places-manager';
import { SESSION_CONFIG } from '@/managers/session-manager';
import { travelInfoManager } from '@/utils/travel-info-utils';
import { loadGoogleMapsScript, getMapId, GoogleMapManager } from '../../utils/maps-utils';

interface MapComponentProps {
    city: string;
    apiKey: string;
    theme?: 'dark' | 'light';
}

declare global {
    interface Window {
        setupMapInstance?: () => void;
        currentSlide: number;
        updateCarousel: () => void;
        nextSlide: () => void;
        prevSlide: () => void;
        goToSlide: (index: number) => void;
        google: typeof google;
        removePlaceFromMap?: (title: string) => void;
        addPlaceToMap?: (place: { 
            latitude: number; 
            longitude: number; 
            title?: string;
            place?: Place;
        }) => void;
        clearPlaceMarkers?: () => void;
        savedPlaces: Place[];
        getSavedPlaces?: () => Place[];
    }
}

declare global {
    namespace google.maps {
        interface MarkerLibrary {
            AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
            PinElement: typeof google.maps.marker.PinElement;
        }
        namespace geometry {
            namespace encoding {
                function decodePath(encodedPath: string): google.maps.LatLng[];
            }
        }
    }
}

const MapComponent: React.FC<MapComponentProps> = ({ city, apiKey, theme = 'light' }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const mapManagerRef = useRef<GoogleMapManager | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const geometryLoadedRef = useRef(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [markerCount, setMarkerCount] = useState(0);
    // Track current active routes - only store minimal required data
    const [activeRoutes, setActiveRoutes] = useState<{fromId: string, toId: string}[]>([]);
    // Track polylines for cleanup
    const polylineRef = useRef<Map<string, google.maps.Polyline>>(new Map());

    // Move setupMapInstance outside of the effect
    async function setupMapInstance(forceUpdate = false) {
        if (!mapRef.current || (!forceUpdate && mapInstanceRef.current)) return;

        try {
            // Use the city prop directly, fallback to session storage if needed
            let targetCity = city;
            if (!targetCity) {
                const sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    targetCity = parsed.city;
                }
            }

            if (!targetCity) {
                console.error('No city specified');
                setIsLoading(false);
                return;
            }

            const location = await getLocation(targetCity);
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 12,
                center: location,
                mapId: theme === 'dark' ? '61462f35959f2552' : '32620e6bdcb7e236'
            });

            mapInstanceRef.current = map;
            setMap(map);
            
            // Initialize map manager
            mapManagerRef.current = new GoogleMapManager(mapInstanceRef.current, apiKey);

            // Dynamically import the geometry library
            console.log('[MapComponent] Loading geometry library...');
            await google.maps.importLibrary("geometry");
            geometryLoadedRef.current = true;
            console.log('[MapComponent] Geometry library loaded successfully');

            // Re-trigger route drawing if we have active routes
            if (activeRoutes.length > 0) {
                console.log('[MapComponent] Re-triggering route drawing for existing routes');
                const currentRoutes = activeRoutes;
                setActiveRoutes([]);
                setTimeout(() => setActiveRoutes(currentRoutes), 100);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error setting up map:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!apiKey) return;

        // First, attach setupMapInstance to window
        window.setupMapInstance = () => {
            setupMapInstance();
        };

        const loadGoogleMapsScript = () => {
            // If Maps is already loaded, initialize directly
            if (window.google?.maps) {
                setupMapInstance();
                return;
            }

            // Don't load script if it's already being loaded
            if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
                return;
            }

            try {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly&map_ids=32620e6bdcb7e236,61462f35959f2552&callback=setupMapInstance`;
                script.async = true;
                script.defer = true;
                
                // Add error handling
                script.onerror = () => {
                    console.error('[MapComponent] Failed to load Google Maps script');
                    setError('Failed to load map');
                    setIsLoading(false);
                };

                document.head.appendChild(script);
            } catch (error) {
                console.error('[MapComponent] Error loading script:', error);
                setError('Failed to initialize map');
                setIsLoading(false);
            }
        };

        // Load the script
        loadGoogleMapsScript();

        // Cleanup
        return () => {
            if (window.setupMapInstance) {
                delete window.setupMapInstance;
            }
        };
    }, [apiKey]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const setupMapFeatures = async () => {
            if (!mapInstanceRef.current) return;

            try {
                const location = await getLocation(city);
                
                // Update existing map instead of creating new one
                mapInstanceRef.current.setCenter(location);
                mapInstanceRef.current.setZoom(12);
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error updating map features:', error);
                setIsLoading(false);
            }
        };

        setupMapFeatures();
    }, [city]);

    useEffect(() => {
        if (!map) return;

        const initializeMap = async () => {
            // Wait for map to be idle before restoring markers
            await new Promise<void>((resolve) => {
                google.maps.event.addListenerOnce(map, 'idle', () => {
                    resolve();
                });
            });
            
            const savedPlaces = savedPlacesManager.getPlaces();
            console.log('Restoring markers for saved places:', savedPlaces.length);
            
            savedPlaces.forEach(place => {
                if (place.location) {
                    window.addPlaceToMap?.({
                        latitude: place.location.latitude,
                        longitude: place.location.longitude,
                        title: typeof place.displayName === 'string' ? place.displayName : place.displayName.text,
                        place: place
                    });
                }
            });
        };

        initializeMap();
    }, [map]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        window.removePlaceFromMap = (placeId: string) => {
            console.log('Debug - Starting removal process for placeId:', placeId);
            
            try {
                mapManagerRef.current?.removeMarker(placeId);
                savedPlacesManager.removePlace(placeId);

                console.log('Debug - Successfully removed marker and place:', placeId);
            } catch (error) {
                console.error('Debug - Error during marker removal:', error);
            }
            
            window.dispatchEvent(new CustomEvent('savedPlacesChanged', {
                detail: {
                    places: Array.from(savedPlacesManager.places.values()),
                    count: savedPlacesManager.places.size
                }
            }));
        };

        window.addPlaceToMap = async (data: { 
            latitude: number; 
            longitude: number; 
            title?: string;
            place?: Place;
        }) => {
            try {
                if (!data.place) return;
                
                // Add place to saved places manager
                savedPlacesManager.addPlace(data.place);
                
                // Create marker with day and order index
                await mapManagerRef.current?.createMarker(data.place, {
                    dayIndex: data.place.dayIndex,
                    orderIndex: data.place.orderIndex
                });

                // Notify about places change
                window.dispatchEvent(new CustomEvent('savedPlacesChanged', {
                    detail: {
                        places: Array.from(savedPlacesManager.places.values()),
                        count: savedPlacesManager.places.size
                    }
                }));
            } catch (err) {
                console.error('Error adding place marker:', err);
            }
        };

        window.getSavedPlaces = () => {
            return savedPlacesManager.getPlaces();
        };
        
    }, [mapInstanceRef.current]); // Only depend on the map instance

    useEffect(() => {
        const sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                const updatedPlaces = savedPlacesManager.getPlaces();
                const sessionDataWithUpdatedPlaces = {
                    ...parsed,
                    lastActive: Date.now(),
                    savedPlaces: updatedPlaces
                };
                sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(sessionDataWithUpdatedPlaces));
            } catch (error) {
                console.error('Error saving places to session:', error);
            }
        }
    }, [savedPlacesManager]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && map) {
                window.google?.maps?.event?.trigger(map, 'resize');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [map]);

    useEffect(() => {
        const sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                if (parsed.savedPlaces) {
                    parsed.savedPlaces.forEach((place: Place) => {
                        if (place.id) {
                            savedPlacesManager.addPlace(place);
                        }
                    });
                    window.dispatchEvent(new CustomEvent('savedPlacesChanged', {
                        detail: {
                            places: Array.from(savedPlacesManager.places.values()),
                            count: savedPlacesManager.places.size
                        }
                    }));
                }
            } catch (error) {
                console.error('Error loading saved places from session:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        const handleTravelInfoDisplay = (event: Event) => {
            const e = event as CustomEvent<{fromId: string, toId: string}>;
            console.log('[MapComponent] Received travelinfo-displayed event:', e.detail);
            setActiveRoutes(prev => [...prev, e.detail]);
        };

        const handleTravelInfoHide = (event: Event) => {
            const e = event as CustomEvent<{fromId: string, toId: string}>;
            console.log('[MapComponent] Received travelinfo-hidden event:', e.detail);
            setActiveRoutes(prev => 
                prev.filter(route => 
                    !(route.fromId === e.detail.fromId && route.toId === e.detail.toId)
                )
            );
        };

        // Handle any place changes (drag, shuffle, removal)
        const handlePlacesChanged = () => {
            console.log('[MapComponent] Places changed, clearing routes');
            // First clear all existing routes from the map
            polylineRef.current.forEach(polyline => polyline.setMap(null));
            polylineRef.current.clear();
            
            // Reset active routes state
            setActiveRoutes([]);
            
            // Get all places and sort them by day and order
            const places = savedPlacesManager.getPlaces();
            const placesByDay = places.reduce((acc, place) => {
                const dayIndex = place.dayIndex ?? 0;
                if (!acc[dayIndex]) acc[dayIndex] = [];
                acc[dayIndex].push(place);
                return acc;
            }, {} as Record<number, Place[]>);

            // Sort places within each day and create routes
            Object.entries(placesByDay).forEach(([dayIndex, dayPlaces]) => {
                dayPlaces.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
                
                // Create routes between consecutive places
                for (let i = 0; i < dayPlaces.length - 1; i++) {
                    const fromPlace = dayPlaces[i];
                    const toPlace = dayPlaces[i + 1];
                    setActiveRoutes(prev => [...prev, { fromId: fromPlace.id, toId: toPlace.id }]);
                }
            });

            // Force re-render of travel-info components
            window.dispatchEvent(new CustomEvent('places-reordered'));
        };

        // Clear markers and redraw them
        const updateMarkers = () => {
            // Clear existing markers
            mapManagerRef.current?.clearMarkers();
            
            // Add new markers
            const places = savedPlacesManager.getPlaces();
            places.forEach(place => {
                if (place.location) {
                    mapManagerRef.current?.createMarker(place, {
                        dayIndex: place.dayIndex,
                        orderIndex: place.orderIndex
                    });
                }
            });
        };

        window.addEventListener('travelinfo-displayed', handleTravelInfoDisplay);
        window.addEventListener('travelinfo-hidden', handleTravelInfoHide);
        window.addEventListener('places-changed', handlePlacesChanged);
        window.addEventListener('places-changed', updateMarkers);

        return () => {
            window.removeEventListener('travelinfo-displayed', handleTravelInfoDisplay);
            window.removeEventListener('travelinfo-hidden', handleTravelInfoHide);
            window.removeEventListener('places-changed', handlePlacesChanged);
            window.removeEventListener('places-changed', updateMarkers);
        };
    }, [mapInstanceRef.current]);

    useEffect(() => {
        if (!mapInstanceRef.current || !geometryLoadedRef.current) {
            console.log('[MapComponent] Route drawing skipped:', {
                hasMap: !!mapInstanceRef.current,
                geometryLoaded: geometryLoadedRef.current,
                activeRoutes
            });
            return;
        }

        console.log('[MapComponent] Starting to draw routes for:', activeRoutes);

        // Clear all existing routes first
        polylineRef.current.forEach(polyline => {
            polyline.setMap(null); // Remove from map
        });
        polylineRef.current.clear(); // Clear our references

        // Draw routes for each active travel-info
        activeRoutes.forEach(async ({ fromId, toId }) => {
            const fromPlace = savedPlacesManager.getPlaceById(fromId);
            const toPlace = savedPlacesManager.getPlaceById(toId);
            
            console.log('[MapComponent] Drawing route between places:', {
                fromPlace: fromPlace?.displayName,
                toPlace: toPlace?.displayName,
                fromDayIndex: fromPlace?.dayIndex,
                toDayIndex: toPlace?.dayIndex
            });
            
            if (!fromPlace?.location || !toPlace?.location || 
                fromPlace.dayIndex === undefined || toPlace.dayIndex === undefined || 
                fromPlace.dayIndex !== toPlace.dayIndex) {
                console.log('[MapComponent] Skipping route due to invalid places or different days');
                return;
            }

            const color = getRouteColor(fromPlace.dayIndex);
            const polyline = await drawRoute([fromPlace, toPlace], color);
            if (polyline) {
                const routeKey = `${fromId}-${toId}`;
                console.log('[MapComponent] Successfully created polyline for route:', routeKey);
                // First remove any existing polyline for this route
                const existingPolyline = polylineRef.current.get(routeKey);
                if (existingPolyline) {
                    existingPolyline.setMap(null);
                }
                // Store reference before setting map
                polylineRef.current.set(routeKey, polyline);
                // Now set the map
                polyline.setMap(mapInstanceRef.current);
            } else {
                console.log('[MapComponent] Failed to create polyline for route:', {fromId, toId});
            }
        });

        // Cleanup function to ensure all polylines are removed when component unmounts or routes change
        return () => {
            console.log('[MapComponent] Cleaning up routes');
            polylineRef.current.forEach(polyline => {
                polyline.setMap(null);
            });
        };
    }, [activeRoutes]);

    const drawRoute = async (places: Place[], color: string) => {
        if (!places || places.length !== 2 || !mapInstanceRef.current || !isGeometryReady()) {
            console.log('[MapComponent] Draw route preconditions failed:', {
                hasPlaces: !!places,
                correctLength: places?.length === 2,
                hasMap: !!mapInstanceRef.current,
                geometryReady: isGeometryReady()
            });
            return;
        }

        const [place1, place2] = places;
        if (!place1.location || !place2.location) {
            console.log('[MapComponent] Missing location data:', {
                place1Location: !!place1.location,
                place2Location: !!place2.location
            });
            return;
        }

        try {
            console.log('[MapComponent] Fetching travel info for places:', {
                from: place1.displayName,
                to: place2.displayName
            });
            
            const info = await travelInfoManager.getTravelInfo(place1, place2);
            console.log('[MapComponent] Got travel info:', {
                hasInfo: !!info,
                hasPolyline: !!info?.legPolyline,
                polylineLength: info?.legPolyline?.length
            });

            if (!info || !info.legPolyline) return;

            const path = google.maps.geometry.encoding.decodePath(info.legPolyline);
            console.log('[MapComponent] Decoded path points:', path.length);
            
            // Create polyline but don't set map yet
            return new google.maps.Polyline({
                path,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 5
            });
        } catch (error) {
            console.error('[MapComponent] Error drawing route:', error);
            return null;
        }
    };

    const isGeometryReady = () => {
        return !!(
            window.google?.maps?.geometry?.encoding?.decodePath &&
            typeof window.google.maps.geometry.encoding.decodePath === 'function'
        );
    };

    const getRouteColor = (dayIndex: number) => {
        const colors = [
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
        return colors[dayIndex % colors.length];
    };

    const handleSlideChange = (_: any, index: number) => {
        if (window.currentSlide !== undefined) {
            window.currentSlide = index;
        }
    };

    const drawRouteBetweenPlaces = async (fromPlace: Place, toPlace: Place) => {
        if (!mapInstanceRef.current || !fromPlace.location || !toPlace.location) return;

        try {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                map: mapInstanceRef.current,
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                    strokeColor: getRouteColor(fromPlace.dayIndex ?? 0),
                    strokeWeight: 3,
                    strokeOpacity: 0.7
                }
            });

            const request = {
                origin: { lat: fromPlace.location.latitude, lng: fromPlace.location.longitude },
                destination: { lat: toPlace.location.latitude, lng: toPlace.location.longitude },
                travelMode: google.maps.TravelMode.WALKING
            };

            const result = await directionsService.route(request);
            directionsRenderer.setDirections(result);

            // Store the renderer for later cleanup
            setActiveRoutes(prev => [...prev, { fromId: fromPlace.id, toId: toPlace.id }]);
            
            return directionsRenderer;
        } catch (error) {
            console.error('[MapComponent] Error drawing route:', error);
            return null;
        }
    };

    // Update markers for a specific day
    const updateDayMarkers = useCallback((dayIndex: string) => {
        if (!mapManagerRef.current) return;
        
        const dayPlaces = Array.from(savedPlacesManager.places.values())
            .filter(place => place.dayIndex === Number(dayIndex));
            
        if (dayPlaces.length > 0) {
            // Sort places by order index
            dayPlaces.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            
            dayPlaces.forEach((place, index) => {
                const marker = mapManagerRef.current?.getMarker(place.id);
                if (marker) {
                    // Update marker appearance
                    mapManagerRef.current?.updateMarker(place.id, {
                        dayIndex: Number(dayIndex),
                        orderIndex: index
                    });
                }
            });

            // Draw routes between consecutive places
            for (let i = 0; i < dayPlaces.length - 1; i++) {
                drawRouteBetweenPlaces(dayPlaces[i], dayPlaces[i + 1]);
            }
        }
    }, [drawRouteBetweenPlaces]);

    // Update markers with new color and glyph numberings after optimization
    const updateOptimizedMarkers = useCallback(async () => {
        if (!mapManagerRef.current || !mapInstanceRef.current) return;

        // Clear existing routes
        setActiveRoutes([]);

        // Get optimized places with indices
        const places = savedPlacesManager.getPlaces();
        
        // Group by day and update markers
        const placesByDay = places.reduce((acc, place) => {
            const dayIndex = place.dayIndex ?? 0;
            if (!acc[dayIndex]) acc[dayIndex] = [];
            acc[dayIndex].push(place);
            return acc;
        }, {} as Record<number, Place[]>);

        // Update markers and prepare routes for each day
        Object.entries(placesByDay).forEach(([dayIndex, dayPlaces]) => {
            // Sort places by order index
            dayPlaces.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            
            // Update markers for this day
            dayPlaces.forEach((place, index) => {
                const marker = mapManagerRef.current?.getMarker(place.id);
                if (marker) {
                    mapManagerRef.current?.updateMarker(place.id, {
                        dayIndex: Number(dayIndex),
                        orderIndex: index
                    });
                }
            });

            // Draw routes between consecutive places
            for (let i = 0; i < dayPlaces.length - 1; i++) {
                drawRouteBetweenPlaces(dayPlaces[i], dayPlaces[i + 1]);
            }
        });
    }, [drawRouteBetweenPlaces]);

    useEffect(() => {
        const handleOptimizationApplied = () => {
            updateOptimizedMarkers();
        };

        window.addEventListener('optimization-applied', handleOptimizationApplied);
        return () => window.removeEventListener('optimization-applied', handleOptimizationApplied);
    }, [updateOptimizedMarkers]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            console.log('[MapComponent] Theme change - clearing map');
            // Clear all markers first
            mapManagerRef.current?.clearMarkers();
            // Clear the map instance
            mapInstanceRef.current = null;
            setMap(null);
            // Reinitialize
            setupMapInstance(true);
            // Re-trigger route drawing
            const currentRoutes = activeRoutes;
            setActiveRoutes([]);
            setTimeout(() => {
                console.log('[MapComponent] Restoring routes after theme change:', currentRoutes);
                setActiveRoutes(currentRoutes);
            }, 100);
        }
    }, [theme]);

    const handlePlaceSelect = useCallback((place: Place) => {
        if (!mapManagerRef.current) return;
        
        setSelectedPlace(place);
        const marker = mapManagerRef.current.getMarker(place.id);
        if (marker) {
            mapManagerRef.current.showInfoWindow(place, marker);
        }
    }, []);

    const getLocation = async (city: string) => {
        const geocoder = new window.google.maps.Geocoder();

        return new Promise<google.maps.LatLng>((resolve, reject) => {
            geocoder.geocode(
                { address: city },
                (results, status) => {
                    if (status !== 'OK' || !results?.[0]?.geometry?.location) {
                        console.error('Geocoding failed:', status);
                        reject('Could not find location for ' + city);
                    } else {
                        resolve(results[0].geometry.location);
                    }
                }
            );
        });
    };

    return (
        <div className="w-full h-full relative">
            <div ref={mapRef} className="w-full h-full" />
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
                    {error}
                </div>
            )}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;