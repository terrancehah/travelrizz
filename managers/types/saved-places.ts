import { Place } from '@/managers/types'

export interface SavedPlacesManager {
    places: Map<string, Place>
    addPlace: (place: Place) => void
    removePlace: (id: string) => void
    getPlaces: () => Place[]
    getPlaceById: (id: string) => Place | undefined
    hasPlace: (id: string) => boolean
    updatePlace: (place: Place) => void
    updatePlaces: (updatedPlaces: Place[]) => Promise<void>
    updatePlacesWithIndices: (optimizedPlaces: Place[]) => Promise<void>
    _persist: () => Promise<void>
    _notifyChange: () => Promise<void>
    serialize: () => string
    reset: () => void
}
