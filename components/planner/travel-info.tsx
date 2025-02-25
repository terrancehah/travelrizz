import { Clock, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { Place } from '@/utils/places-utils'
import { travelInfoManager } from '@/utils/travel-info-utils'
import { useTranslations } from 'next-intl'

interface TravelInfoProps {
  place: Place
  nextPlace: Place
  className?: string
}

interface TravelData {
  durationSeconds: number;
  distanceMeters: number;
  error?: boolean;
}

export function TravelInfo({ place, nextPlace, className }: TravelInfoProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [travelData, setTravelData] = useState<TravelData | null>(null)
  const tPlan  = useTranslations('itineraryplanner')

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}${tPlan('units.hour')} ${minutes}${tPlan('units.minute')}`;
    }
    return `${minutes}${tPlan(minutes === 1 ? 'units.minute' : 'units.minutes')}`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km >= 1 
      ? `${km.toFixed(1)}${tPlan('units.kilometer')}`
      : `${meters}${tPlan('units.meter')}`;
  };

  useEffect(() => {
    const isMounted = { current: true }; // Track mount state

    // Clear all routes involving these places
    if (place?.id && nextPlace?.id) {
      // First clear all routes in the manager
      travelInfoManager.clearRoutesForPlaces([place, nextPlace]);
      // Then notify map to remove the visual routes
      window.dispatchEvent(new CustomEvent('travelinfo-hidden', {
        detail: { fromId: place.id, toId: nextPlace.id }
      }));
    }

    async function fetchTravelInfo() {
      try {
        console.log('[TravelInfo] Fetching info for:', {
          from: place?.displayName,
          to: nextPlace?.displayName,
          fromId: place?.id,
          toId: nextPlace?.id
        });
        
        setIsLoading(true)
        const info = await travelInfoManager.getTravelInfo(place, nextPlace)
        
        // Only proceed if still mounted
        if (!isMounted.current) {
          console.log('[TravelInfo] Component unmounted, skipping update');
          return;
        }

        console.log('[TravelInfo] Received info:', info);
        
        if (info) {
          setTravelData({
            durationSeconds: info.durationSeconds,
            distanceMeters: info.distanceMeters,
            error: info.error
          })
          // Only notify for display if we have valid info AND component is still mounted
          if (!info.error && place?.id && nextPlace?.id && isMounted.current) {
            window.dispatchEvent(new CustomEvent('travelinfo-displayed', { 
              detail: { fromId: place.id, toId: nextPlace.id }
            }));
          }
        }
      } catch (error) {
        console.error('[TravelInfo] Error:', error)
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    // Handler for places-reordered event
    const handlePlacesReordered = () => {
      if (place?.location && nextPlace?.location) {
        fetchTravelInfo();
      }
    };

    if (place?.location && nextPlace?.location) {
      console.log('[TravelInfo] Starting fetch for:', {
        hasLocation: {
          from: !!place?.location,
          to: !!nextPlace?.location
        }
      });
      fetchTravelInfo()
    } else {
      console.log('[TravelInfo] Missing location:', {
        from: place?.displayName,
        to: nextPlace?.displayName,
        fromLocation: place?.location,
        toLocation: nextPlace?.location
      });
    }

    window.addEventListener('places-reordered', handlePlacesReordered);

    // Cleanup when component unmounts or places change
    return () => {
      isMounted.current = false;
      window.removeEventListener('places-reordered', handlePlacesReordered);
      if (place?.id && nextPlace?.id) {
        window.dispatchEvent(new CustomEvent('travelinfo-hidden', {
          detail: { fromId: place.id, toId: nextPlace.id }
        }));
      }
    };
  }, [place?.id, nextPlace?.id, place?.location?.latitude, place?.location?.longitude, nextPlace?.location?.latitude, nextPlace?.location?.longitude])

  return (
    <div className={cn(
      "relative my-2 flex items-center gap-3 py-3 md:py-4",
      "transition-opacity duration-200",
      className
    )}>
      <div className="absolute inset-y-2 w-0.5 bg-muted-foreground"></div>
      <div className="z-10 flex flex-col gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className={cn("h-4 w-4", isLoading && "animate-pulse")} />
          {isLoading ? (
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <span>{travelData ? formatDuration(travelData.durationSeconds) : '--'}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ArrowLeftRight className={cn("h-4 w-4", isLoading && "animate-pulse")} />
          {isLoading ? (
            <div className="h-4 w-14 animate-pulse rounded bg-muted" />
          ) : (
            <span>{travelData ? formatDistance(travelData.distanceMeters) : '--'}</span>
          )}
        </div>
      </div>
    </div>
  )
}
