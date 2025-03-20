import React, { useState, useEffect, useMemo } from 'react';
import { Place } from '@/managers/types';
import { savedPlacesManager } from '@/managers/saved-places-manager';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface SavedPlacesListProps {
    onCenterMap?: (location: { latitude: number, longitude: number }) => void;
    onRemove?: (placeId: string) => void;
}

interface PhotoState {
    [key: string]: string;  // photoName -> URL mapping
}

export function SavedPlacesList({ onCenterMap, onRemove }: SavedPlacesListProps) {
    // Get places directly from savedPlacesManager
    const [places] = useState(() => savedPlacesManager.getPlaces());
    const fonts = useLocalizedFont();
    const [photoUrls, setPhotoUrls] = useState<PhotoState>({});

    // Memoize unique places to prevent infinite updates
    const uniquePlaces = useMemo(() => 
        Array.from(new Map(places.map(place => [place.id, place])).values()),
        [places]
    );

    useEffect(() => {
        const fetchPhotos = async () => {
            const newPhotoUrls: PhotoState = {};
            
            for (const place of uniquePlaces) {
                if (place.photos?.[0]?.name) {
                    const photoUrl = `/api/places/photos?photoName=${place.photos[0].name}&maxWidth=400&maxHeight=400`;
                    newPhotoUrls[place.photos[0].name] = photoUrl;
                }
            }
            
            setPhotoUrls(newPhotoUrls);
        };

        fetchPhotos();
        
        // Cleanup object URLs on unmount
        return () => {
            Object.values(photoUrls).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [uniquePlaces]);

    console.log('[SavedPlacesList] Rendering with places:', uniquePlaces.map(p => ({
        id: p.id,
        displayName: p.displayName,
        photos: p.photos,
        primaryType: p.primaryType,
        primaryTypeDisplayName: p.primaryTypeDisplayName
    })));

    if (!uniquePlaces || uniquePlaces.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No saved places yet.</p>
            </div>
        );
    }

    return (
        <div className="w-[90%] xl:w-[80%] max-w-2xl mx-auto rounded-2xl border shadow-md border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
            {uniquePlaces.map((place: Place) => {
                const photoName = place.photos?.[0]?.name;
                const photoUrl = photoName && photoUrls[photoName]
                    ? photoUrls[photoName]
                    : '/images/placeholder-image.jpg';
                
                console.log('[SavedPlacesList] Rendering place:', {
                    id: place.id,
                    photoName,
                    hasPhotoUrl: Boolean(photoUrls[photoName || ''])
                });
                
                // Ensure photos array exists and has valid entries
                const hasValidPhoto = Array.isArray(place.photos) && 
                    place.photos.length > 0 && 
                    place.photos[0]?.name;
                
                return (
                    <div 
                        key={place.id} 
                        className="bg-white h-40 dark:bg-gray-900 overflow-hidden flex border-b-[1px] border-gray-200 dark:border-gray-700"
                    >
                        {/* Photo Section */}
                        <div className="w-1/3">
                            <img
                                src={photoUrl}
                                alt={typeof place.displayName === 'string' ? place.displayName : place.displayName.text}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('[SavedPlacesList] Image load error for place:', place.id);
                                    e.currentTarget.src = '/images/placeholder-image.jpg';
                                }}
                            />
                        </div>

                        {/* Content Section */}
                        <div className="w-2/3 p-4 flex flex-col justify-around">
                            <h3 className={`${fonts.text} text-lg font-bold text-gray-800 dark:text-gray-100`}>
                                {typeof place.displayName === 'string' 
                                    ? place.displayName 
                                    : place.displayName.text}
                            </h3>
                            <p className={`${fonts.text} text-sm text-gray-600 dark:text-gray-400`}>
                                {place.primaryTypeDisplayName?.text || place.primaryType}
                            </p>
                            <p className={`${fonts.text} text-sm text-gray-700 dark:text-gray-300`}>{place.formattedAddress}</p>
                            
                            {/* Actions */}
                            {/* <div className="flex justify-end space-x-2">
                                {onCenterMap && place.location && (
                                    <button
                                        onClick={() => onCenterMap(place.location!)}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Center on Map
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        onClick={() => onRemove(place.id)}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div> */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
