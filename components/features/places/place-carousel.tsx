import React, { useState, useEffect } from 'react';
import { Place } from '@/managers/types';
import { PlaceCard } from './place-card';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { savedPlacesManager } from '@/managers/saved-places-manager';

// Interface for map operations
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

export const PlaceCarousel = ({ places }: { places: Place[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledPlaces, setShuffledPlaces] = useState<Place[]>([]);
    const fonts = useLocalizedFont();

    useEffect(() => {
        const shuffled = [...places]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        setShuffledPlaces(shuffled);
    }, [places]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev + shuffledPlaces.length - 1) % shuffledPlaces.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % shuffledPlaces.length);
    };

    useEffect(() => {
        shuffledPlaces.forEach(place => {
            if (place?.location) {
                if (!savedPlacesManager.hasPlace(place.id)) {
                    savedPlacesManager.addPlace(place);
                    dispatchMapOperation({
                        type: 'add-place',
                        place
                    });
                } else {
                    dispatchMapOperation({
                        type: 'update-place',
                        place
                    });
                }
            }
        });
    }, [shuffledPlaces]);

    return (
        <div className="carousel-wrapper p-0 w-full max-h-min flex justify-center mt-4">

            <div className="relative w-full p-0 max-h-min flex flex-row justify-center max-w-2xl mx-auto">

                {/* Previous button */}
                <button className="h-min my-auto mr-2 z-10 bg-sky-100/40 dark:bg-gray-700 text-black dark:text-white 
                border border-slate-400/60 p-2 rounded-full hover:bg-sky-100 focus:outline-none" onClick={prevSlide}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Carousel */}
                <div className="carousel-container w-[70%] overflow-hidden">
                    <div className="carousel flex transition-transform duration-500 ease-in-out" 
                        style={{ 
                            transform: `translateX(-${currentIndex * 100}%)`,
                            height: 'min-content'
                        }}>
                        {shuffledPlaces.map((place: Place, index: number) => (
                            <div key={place.id || index} className="flex-none max-h-min w-full my-auto flex justify-center p-1">
                                <PlaceCard place={place} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next button */}
                <button className="h-min my-auto ml-2 z-10 bg-sky-100/40 dark:bg-gray-700 text-black dark:text-white 
                border border-slate-400/60 p-2 rounded-full hover:bg-sky-100 focus:outline-none" onClick={nextSlide}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
