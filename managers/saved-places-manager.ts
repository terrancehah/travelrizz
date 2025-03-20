import { Place } from './types'
import { SESSION_CONFIG, getStoredSession, updateSavedPlacesInSession } from './session-manager'
import { safeStorageOp, storage } from '../utils/storage-utils'


// SavedPlacesManager interface
export interface SavedPlacesManager {
    places: Map<string, Place>
    temporaryPlaces: Set<Place>
    addPlace: (place: Place) => void
    removePlace: (id: string) => void
    getPlaces: () => Place[]
    getPlaceById: (id: string) => Place | undefined
    hasPlace: (id: string) => boolean
    updatePlace: (place: Place) => void
    updatePlaces: (updatedPlaces: Place[]) => Promise<void>
    updatePlacesWithIndices: (optimizedPlaces: Place[]) => Promise<void>
    addTemporaryPlaces: (places: Place[]) => void
    clearTemporaryPlaces: () => void
    _persist: () => Promise<void>
    _notifyChange: () => Promise<void>
    serialize: () => string
    reset: () => void
}

// SavedPlacesManager singleton
function createSavedPlacesManager(): SavedPlacesManager {
    const places = new Map<string, Place>()
    const temporaryPlaces = new Set<Place>()
    
    // Load saved places from session
    try {
        const session = getStoredSession()
        if (session?.savedPlaces) {
            session.savedPlaces.forEach((place: Place) => {
                places.set(place.id, place)
            })
        }
    } catch (error) {
        console.error('Error loading saved places from session:', error)
    }
    
    const manager: SavedPlacesManager = {
        places,
        temporaryPlaces,
        
        addPlace(place: Place) {
            this.places.set(place.id, place)
            this._persist()
            this._notifyChange()
        },
        
        removePlace(id: string) {
            this.places.delete(id)
            this._persist()
            this._notifyChange()
        },
        
        getPlaces() {
            return Array.from(this.places.values())
        },
        
        getPlaceById(id: string) {
            return this.places.get(id)
        },
        
        hasPlace(id: string) {
            return this.places.has(id)
        },
        
        updatePlace(place: Place) {
            if (this.places.has(place.id)) {
                this.places.set(place.id, place)
                this._persist()
                this._notifyChange()
            }
        },
        
        async updatePlaces(updatedPlaces: Place[]) {
            updatedPlaces.forEach(place => {
                if (this.places.has(place.id)) {
                    this.places.set(place.id, place)
                }
            })
            await this._persist()
            await this._notifyChange()
        },
        
        // New method to update places with day and order indices
        async updatePlacesWithIndices(optimizedPlaces: Place[]) {
            
            console.log('[Manager] Received optimized places:', 
                optimizedPlaces.map(p => ({ 
                    id: p.id, 
                    day: p.dayIndex,
                    order: p.orderIndex 
                }))
            );
            
            optimizedPlaces.forEach(place => {
                if (this.places.has(place.id)) {
                    const existing = this.places.get(place.id)!;
                    console.log('[Manager] Before update:', {
                        existingDay: existing.dayIndex,
                        existingOrder: existing.orderIndex,
                        newDay: place.dayIndex,
                        newOrder: place.orderIndex
                    });
                    
                    this.places.set(place.id, {
                        ...existing,
                        dayIndex: place.dayIndex,
                        orderIndex: place.orderIndex
                    });
                }
            });
            await this._persist()
            await this._notifyChange()
        },
        
        addTemporaryPlaces(places: Place[]) {
            places.forEach(place => this.temporaryPlaces.add(place))
        },
        
        clearTemporaryPlaces() {
            this.temporaryPlaces.clear()
        },
        
        async _persist() {
            try {
                const placesArray = Array.from(this.places.values());
                updateSavedPlacesInSession(placesArray);
                console.log('[SavedPlacesManager] Successfully persisted to session');
            } catch (error) {
                console.error('[SavedPlacesManager] Error persisting to session:', error);
            }
        },
        
        async _notifyChange() {
            if (typeof window !== 'undefined') {
                window.savedPlaces = this.getPlaces()
                window.updateCarousel?.()
            }
        },
        
        serialize() {
            return JSON.stringify(Array.from(this.places.values()))
        },
        
        reset() {
            this.places.clear()
            this._persist()
            this._notifyChange()
        }
    }
    
    return manager
}

export const savedPlacesManager = createSavedPlacesManager()

// Initialize on client side
if (typeof window !== 'undefined') {
    window.savedPlaces = savedPlacesManager.getPlaces()
    window.savedPlacesManager = savedPlacesManager as SavedPlacesManager // Type assertion
}
