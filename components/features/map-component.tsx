import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Place } from '@/managers/types';
import { searchPlaceByText } from '@/utils/places-utils';
import { savedPlacesManager } from '@/managers/saved-places-manager';
import { SESSION_CONFIG } from '@/managers/session-manager';
import { travelInfoManager } from '@/utils/travel-info-utils';
import { loadGoogleMapsScript, getMapId, GoogleMapManager } from '../../utils/maps-utils';

interface MapComponentProps {
    city: string;
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

// Custom events for map operations
interface MapOperationEvent extends CustomEvent<MapOperationDetail> {}

interface MapOperationDetail {
    type: 'add-place' | 'remove-place' | 'update-place';
    place?: Place;
    placeId?: string;
    places?: Place[];
    count?: number;
}

// Helper function to dispatch map operations
const dispatchMapOperation = (detail: MapOperationDetail) => {
    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', { detail }));
};

const MapComponent: React.FC<MapComponentProps> = ({ city, theme = 'light' }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const mapManagerRef = useRef<GoogleMapManager | null>(null);
    const apiKeyRef = useRef<string | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const geometryLoadedRef = useRef(false);
    const [activeRoutes, setActiveRoutes] = useState<{fromId: string, toId: string}[]>([]);
    const polylineRef = useRef<Map<string, google.maps.Polyline>>(new Map());

    const finishMapSetup = useCallback(async (currentMap: google.maps.Map, currentApiKey: string) => {
        if (!currentMap) {
            console.error("[MapComponent] finishMapSetup called without a map instance.");
            setError('Failed to complete map setup.');
            return;
        }
        if (!currentApiKey) {
            console.warn("[MapComponent] finishMapSetup called without an API key. InfoWindow photos might not work.");
        }

        console.log('[MapComponent] Running finishMapSetup...');
        mapManagerRef.current = new GoogleMapManager(currentMap, currentApiKey);
        console.log('[MapComponent] GoogleMapManager initialized via finishMapSetup.');

        try {
            console.log('[MapComponent] Loading geometry library in finishMapSetup...');
            await google.maps.importLibrary("geometry");
            geometryLoadedRef.current = true;
            console.log('[MapComponent] Geometry library loaded successfully in finishMapSetup.');
        } catch (geomError) {
            console.error('[MapComponent] Error loading geometry library in finishMapSetup:', geomError);
            setError('Failed to load map geometry features.');
        }
        
        if (activeRoutes.length > 0 && geometryLoadedRef.current) {
            console.log('[MapComponent] Re-triggering route drawing from finishMapSetup for existing routes:', activeRoutes.length);
            const routesToRestore = [...activeRoutes];
            setActiveRoutes([]);
            setTimeout(() => setActiveRoutes(routesToRestore), 0);
        }
    }, [activeRoutes]);

    async function setupMapInstance(forceUpdate = false) {
        if (!mapRef.current || (!forceUpdate && mapInstanceRef.current)) return;

        try {
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
            
            mapManagerRef.current = new GoogleMapManager(mapInstanceRef.current, apiKeyRef.current || '');
            console.log('[MapComponent] GoogleMapManager initialized via internal setupMapInstance.');

            try {
                console.log('[MapComponent] Loading geometry library...');
                await google.maps.importLibrary("geometry");
                geometryLoadedRef.current = true;
                console.log('[MapComponent] Geometry library loaded successfully');
            } catch (error) {
                console.error('[MapComponent] Error loading geometry library:', error);
                setError('Failed to load map geometry features.');
            }
            
            setIsMapReady(true);
            setIsLoading(false);

            if (activeRoutes.length > 0) {
                console.log('[MapComponent] Re-triggering route drawing for existing routes');
                const currentRoutes = activeRoutes;
                setActiveRoutes([]);
                setTimeout(() => setActiveRoutes(currentRoutes), 100);
            }

        } catch (error) {
            console.error('Error setting up map:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const initMap = async () => {
            try {
                const response = await fetch('/api/maps/places-key');
                if (!response.ok) throw new Error('Failed to fetch API key');
                const { key } = await response.json();
                if (!key) throw new Error('API key not found');
                apiKeyRef.current = key;

                // Load Google Maps script with proper callback
                await loadGoogleMapsScript(key);

                // Ensure Google Maps is fully loaded
                if (!window.google?.maps) {
                    throw new Error('Google Maps failed to load properly');
                }

                const geoResponse = await fetch('/api/maps/geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: city })
                });
                if (!geoResponse.ok) throw new Error('Failed to geocode');
                const { location } = await geoResponse.json();
                if (!location) throw new Error('Location not found');

                // Safety check before creating map
                if (!mapRef.current) {
                    throw new Error('Map container not ready');
                }

                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: location.latitude, lng: location.longitude },
                    zoom: 13,
                    mapId: getMapId(theme),
                    // Add these options for better stability
                    gestureHandling: 'greedy',
                    disableDefaultUI: false,
                });

                mapInstanceRef.current = mapInstance;
                setMap(mapInstance);
                setIsMapReady(true);
                
                // Wait for map to be fully initialized before finishing setup
                await new Promise(resolve => setTimeout(resolve, 300));
                finishMapSetup(mapInstance, key);

            } catch (err) {
                console.error("Error initializing map:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (city && mapRef.current) {
            initMap();
        }

    }, [city, theme]);

    useEffect(() => {
        if (!isMapReady) return;
        
        const setupMapFeatures = async () => {
            if (!mapInstanceRef.current || !isMapReady) return;
            try {
                const location = await getLocation(city);
                
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter(location);
                    mapInstanceRef.current.setZoom(12);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error updating map features:', error);
                setIsLoading(false);
            }
        };

        setupMapFeatures();
    }, [city, isMapReady]);

    useEffect(() => {
        if (!map) return;

        const initializeMap = async () => {
            await new Promise<void>((resolve) => {
                google.maps.event.addListenerOnce(map, 'idle', () => {
                    resolve();
                });
            });
            
            const savedPlaces = savedPlacesManager.getPlaces();
            console.log('Restoring markers for saved places:', savedPlaces.length);
            
            savedPlaces.forEach(place => {
                if (place.location) {
                    dispatchMapOperation({
                        type: 'add-place',
                        place
                    });
                }
            });
        };

        initializeMap();
    }, [map]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        const handleMapOperation = (event: MapOperationEvent) => {
            const { type, place, placeId } = event.detail;
            
            switch (type) {
                case 'add-place':
                    if (place?.location) {
                        const existingMarker = mapManagerRef.current?.getMarker(place.id);
                        if (existingMarker) {
                            mapManagerRef.current?.updateMarker(place.id, {
                                dayIndex: place.dayIndex,
                                orderIndex: place.orderIndex
                            });
                        } else {
                            mapManagerRef.current?.createMarker(place, {
                                dayIndex: place.dayIndex,
                                orderIndex: place.orderIndex
                            });
                        }
                        if (!savedPlacesManager.hasPlace(place.id)) {
                            savedPlacesManager.addPlace(place);
                        }
                        updateRoutes();
                    }
                    break;
                
                case 'update-place':
                    if (place?.location) {
                        const existingMarker = mapManagerRef.current?.getMarker(place.id);
                        if (existingMarker) {
                            mapManagerRef.current?.updateMarker(place.id, {
                                dayIndex: place.dayIndex,
                                orderIndex: place.orderIndex
                            });
                            savedPlacesManager.updatePlace(place);
                            updateRoutes();
                        }
                    }
                    break;
                
                case 'remove-place':
                    if (placeId) {
                        mapManagerRef.current?.removeMarker(placeId);
                        savedPlacesManager.removePlace(placeId);
                        updateRoutes();
                    }
                    break;
            }
        };

        window.addEventListener('map-operation', handleMapOperation as EventListener);
        
        return () => {
            window.removeEventListener('map-operation', handleMapOperation as EventListener);
        };
    }, [mapInstanceRef.current]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        const savedPlaces = savedPlacesManager.getPlaces();
        savedPlaces.forEach(place => {
            if (place.location) {
                dispatchMapOperation({
                    type: 'add-place',
                    place
                });
            }
        });
    }, [mapInstanceRef.current]);

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
                    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', {
                        detail: {
                            type: 'update-place',
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
        if (!mapInstanceRef.current || !geometryLoadedRef.current) {
            console.log('[MapComponent] Route drawing skipped:', {
                hasMap: !!mapInstanceRef.current,
                geometryLoaded: geometryLoadedRef.current,
                activeRoutes
            });
            return;
        }

        console.log('[MapComponent] Starting to draw routes for:', activeRoutes);

        polylineRef.current.forEach(polyline => {
            polyline.setMap(null);
        });
        polylineRef.current.clear();

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
                const existingPolyline = polylineRef.current.get(routeKey);
                if (existingPolyline) {
                    existingPolyline.setMap(null);
                }
                polylineRef.current.set(routeKey, polyline);
                polyline.setMap(mapInstanceRef.current);
            } else {
                console.log('[MapComponent] Failed to create polyline for route:', {fromId, toId});
            }
        });

        return () => {
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
            '#2196F3', 
            '#FF9800', 
            '#9C27B0', 
            '#4CAF50', 
            '#795548', 
            '#00BCD4', 
            '#E91E63', 
            '#3F51B5', 
        ];
        return colors[dayIndex % colors.length];
    };

    const updateOptimizedMarkers = async () => {
        if (!mapManagerRef.current || !mapInstanceRef.current) return;
    
        setActiveRoutes([]); 

        const places = savedPlacesManager.getPlaces();
        const placesByDay = places.reduce((acc, place) => {
            const dayIndex = place.dayIndex ?? 0;
            if (!acc[dayIndex]) acc[dayIndex] = [];
            acc[dayIndex].push(place);
            return acc;
        }, {} as Record<number, Place[]>);

        let newActiveRoutes: { fromId: string, toId: string }[] = [];

        Object.values(placesByDay).forEach(dayPlaces => {
            dayPlaces.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            
            dayPlaces.forEach(place => {
                const marker = mapManagerRef.current?.getMarker(place.id);
                if (marker) {
                    mapManagerRef.current?.updateMarker(place.id, {
                        dayIndex: place.dayIndex,
                        orderIndex: place.orderIndex
                    });
                }
            });
    
            for (let i = 0; i < dayPlaces.length - 1; i++) {
                const fromPlace = dayPlaces[i];
                const toPlace = dayPlaces[i + 1];
                newActiveRoutes.push({ fromId: fromPlace.id, toId: toPlace.id });
            }
        });

        setActiveRoutes(newActiveRoutes);
    };

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
            mapManagerRef.current?.clearMarkers();
            mapInstanceRef.current = null;
            setMap(null);
            setIsMapReady(false);
            setupMapInstance(true);
            const currentRoutes = activeRoutes;
            setActiveRoutes([]);
            setTimeout(() => {
                console.log('[MapComponent] Restoring routes after theme change:', currentRoutes);
                setActiveRoutes(currentRoutes);
            }, 100);
        }
    }, [theme]);

    const getLocation = async (city: string) => {
        const response = await fetch('/api/maps/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: city }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to geocode address' }));
            console.error('Geocoding failed:', errorData.error);
            throw new Error(`Could not find location for ${city}`);
        }

        const data = await response.json();
        if (!data.location) {
            throw new Error('No location data found in geocode response');
        }

        return new window.google.maps.LatLng(data.location.latitude, data.location.longitude);
    };

    const updateMarkers = () => {
        mapManagerRef.current?.clearMarkers();
        
        const places = savedPlacesManager.getPlaces();
        places.forEach(place => {
            if (place.location) {
                dispatchMapOperation({
                    type: 'add-place',
                    place
                });
            }
        });
    };

    const updateRoutes = () => {
        polylineRef.current.forEach(polyline => polyline.setMap(null));
        polylineRef.current.clear();

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
                const existingPolyline = polylineRef.current.get(routeKey);
                if (existingPolyline) {
                    existingPolyline.setMap(null);
                }
                polylineRef.current.set(routeKey, polyline);
                polyline.setMap(mapInstanceRef.current);
            } else {
                console.log('[MapComponent] Failed to create polyline for route:', {fromId, toId});
            }
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