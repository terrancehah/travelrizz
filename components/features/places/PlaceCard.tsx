import React, { useEffect, useCallback } from 'react';
import { Place, PriceLevel } from '@/managers/types';
import { savedPlacesManager, searchPlaceByText } from '@/utils/places-utils';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface PlaceCardProps {
  place: Place;
  onSelect?: (place: Place) => void;
  onRemove?: (placeId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => {
        if (index < fullStars) {
          return <span key={index} className="text-yellow-400">★</span>;
        } else if (index === fullStars && hasHalfStar) {
          return (
            <span key={index} className="relative">
              <span className="absolute text-gray-300">★</span>
              <span className="absolute text-yellow-400">★</span>
              <div className="relative overflow-hidden w-[50%]">
                <span className="text-yellow-400">★</span>
              </div>
            </span>
          );
        } else {
          return <span key={index} className="text-gray-300">★</span>;
        }
      })}
    </div>
  );
};

const PriceLevelDisplay = ({ priceLevel }: { priceLevel?: PriceLevel }) => {
  // Don't show anything for undefined or UNSPECIFIED
  if (!priceLevel || priceLevel === PriceLevel.UNSPECIFIED) return null;

  // Map price levels to number of filled dollar signs
  const filledCount = {
    [PriceLevel.FREE]: 1,
    [PriceLevel.INEXPENSIVE]: 1,
    [PriceLevel.MODERATE]: 2,
    [PriceLevel.EXPENSIVE]: 3,
    [PriceLevel.VERY_EXPENSIVE]: 4
  }[priceLevel] || 0;

  // Always show 4 signs total
  const totalSigns = 4;
  
  return (
    <span className="flex items-center">
      {[...Array(totalSigns)].map((_, i) => (
        <span 
          key={i} 
          className={`${i < filledCount ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-300 dark:text-gray-600'} font-medium`}
        >
          $
        </span>
      ))}
    </span>
  );
};

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
          <div className="relative w-full h-full">
            <img 
              src="/images/placeholder-image.jpg"
              alt={typeof place.displayName === 'string' ? place.displayName : place.displayName.text}
              className="w-full h-full object-cover filter blur-[2px]"
            />
            <img
              src={`https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=192&maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              alt={typeof place.displayName === 'string' ? place.displayName : place.displayName.text}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => {
                e.currentTarget.remove(); // Simply remove the top image if it fails to load
              }}
            />
          </div>
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
        <div className="flex items-left gap-1 mb-1 flex-col">
          {place.rating && (
            <div className="flex items-center gap-2">
              <span className={`${fonts.text} text-sm font-medium text-gray-900 dark:text-gray-100`}>
                {place.rating.toFixed(1)}
              </span>
              <StarRating rating={place.rating} />
              {place.userRatingCount && (
                <span className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400`}>
                  ({place.userRatingCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className={`${fonts.text} text-sm text-gray-500 dark:text-gray-400 font-medium`}>{getTypeDisplay()}</p>
            {place.priceLevel && <PriceLevelDisplay priceLevel={place.priceLevel} />}
          </div>
          <p className={`${fonts.text} text-sm text-gray-600 dark:text-gray-300`}>{place.formattedAddress}</p>
        </div>
      
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