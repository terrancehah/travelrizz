import React, { useEffect, useCallback, useRef } from 'react';
import { Place, savedPlacesManager, searchPlaceByText } from '@/utils/places-utils';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface PlaceCardProps {
  place: Place;
  onSelect?: (place: Place) => void;
  onRemove?: (placeId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  onRemove,
  isSelected = false,
  showActions = false,
  className = ''
}) => {
  // Get the display name with proper fallback
  const getTypeDisplay = () => {
    if (!place.primaryTypeDisplayName?.text) {
      return ''; // Return empty string if no type display name
    }
    return place.primaryTypeDisplayName.text;
  };

  const fonts = useLocalizedFont();

  const retryCount = useRef<{ [key: string]: number }>({});
  const MAX_RETRIES = 2;

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(place);
    }
  }, [place, onSelect]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(place.id);
      // Remove from savedPlacesManager
      if (savedPlacesManager.hasPlace(place.id)) {
        savedPlacesManager.removePlace(place.id);
      }
    }
  }, [place.id, onRemove]);

  // Add marker to map when card is shown
  useEffect(() => {
    // Add to map if location exists
    if (place?.location && window.addPlaceToMap) {
      console.log('[PlaceCard] Adding place to map:', place);
      window.addPlaceToMap({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        title: typeof place.displayName === 'string' ? place.displayName : place.displayName.text,
        place // Pass the full place object for click handling
      });
    }
  }, [place]);

  return (
    <div className={`place-card h-min shadow-md rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600 ${className}`}>
      <div className="bg-gray-200 h-48 flex items-center justify-center">
        {place.photos && place.photos[0] ? (
          <img
            src={`https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=192&maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            alt={typeof place.displayName === 'string' ? place.displayName : place.displayName.text}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('[PlaceCard] Photo load failed for:', {
                id: place.id,
                name: typeof place.displayName === 'string' ? place.displayName : place.displayName.text
              });
              
              // Initialize and check retry count
              if (!retryCount.current[place.id]) {
                retryCount.current[place.id] = 0;
              }

              // If exceeded max retries, show placeholder
              if (retryCount.current[place.id] >= MAX_RETRIES) {
                e.currentTarget.src = '/images/placeholder-image.jpg';
                e.currentTarget.parentElement?.classList.remove('animate-pulse');
                return;
              }

              // Increment retry count
              retryCount.current[place.id]++;

              // First retry: Try Place ID
              if (retryCount.current[place.id] === 1 && place.id) {
                const placePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.id}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
                e.currentTarget.src = placePhotoUrl;
                return;
              }

              // Second retry: Try refreshing place data
              e.currentTarget.parentElement?.classList.add('animate-pulse');
              searchPlaceByText(
                typeof place.displayName === 'string' ? place.displayName : place.displayName.text,
                place.location || { latitude: 0, longitude: 0 },
                'Singapore'
              ).then(freshPlace => {
                if (freshPlace && freshPlace.photos && freshPlace.photos[0]) {
                  e.currentTarget.parentElement?.classList.remove('animate-pulse');
                  e.currentTarget.src = `https://places.googleapis.com/v1/${freshPlace.photos[0].name}/media?maxHeightPx=192&maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
                  if (savedPlacesManager.hasPlace(place.id)) {
                    savedPlacesManager.addPlace(freshPlace);
                  }
                } else {
                  e.currentTarget.src = '/images/placeholder-image.jpg';
                  e.currentTarget.parentElement?.classList.remove('animate-pulse');
                }
              }).catch(() => {
                e.currentTarget.src = '/images/placeholder-image.jpg';
                e.currentTarget.parentElement?.classList.remove('animate-pulse');
              });
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800">
        <h3 className={`${fonts.text} text-lg font-bold text-gray-900 dark:text-white`}>
          {typeof place.displayName === 'string' 
            ? place.displayName 
            : place.displayName.text}
        </h3>
        <p className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium`}>{getTypeDisplay()}</p>
        <p className={`${fonts.text} text-sm text-gray-600 dark:text-gray-300`}>{place.formattedAddress}</p>
      
        {showActions && (
          <div className="mt-4 flex justify-end gap-2">
            {!isSelected && onSelect && (
              <button
                onClick={handleSelect}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                aria-label={`Select ${place.displayName}`}
              >
                Select
              </button>
            )}
            {/* Temporarily commented out remove button 
            {onRemove && (
              <button
                onClick={handleRemove}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                aria-label={`Remove ${place.displayName}`}
              >
                Remove
              </button>
            )}
            */}
          </div>
        )}
      </div>
    </div>
  );
};