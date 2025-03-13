import React, { useState, useEffect } from 'react';
import { Place } from '@/managers/types';
import { PlaceCard } from './PlaceCard';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

// Interface for map operations
interface MapOperationDetail {
    type: 'add-place' | 'remove-place' | 'places-changed';
    place?: Place;
    placeId?: string;
    places?: Place[];
    count?: number;
}

// Helper function to dispatch map operations
const dispatchMapOperation = (detail: MapOperationDetail) => {
    window.dispatchEvent(new CustomEvent<MapOperationDetail>('map-operation', { detail }));
};

export const Carousel = ({ places }: { places: Place[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fonts = useLocalizedFont();

    const prevSlide = () => {
        setCurrentIndex((currentIndex + places.length - 1) % places.length);
    };

    const nextSlide = () => {
        setCurrentIndex((currentIndex + 1) % places.length);
    };

    // Add all places to map when carousel is shown
    useEffect(() => {
        places.forEach(place => {
            if (place?.location) {
                dispatchMapOperation({
                    type: 'add-place',
                    place
                });
            }
        });
    }, [places]);

    return (
        <div className="carousel-wrapper p-0 w-full max-h-min flex justify-center mt-4">

            <div className="relative w-full p-0 max-h-min flex flex-row justify-center max-w-2xl mx-auto">

                {/* Previous button */}
                <button className="h-min my-auto mr-4 z-10 bg-light-blue dark:bg-gray-700 text-black dark:text-white 
                border border-slate-400/60 p-2 rounded-full hover:bg-gray-200 focus:outline-none" onClick={prevSlide}>
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
                        {places.map((place: Place, index: number) => (
                            <div key={place.id || index} className="flex-none max-h-min w-full mb-2 flex justify-center">
                                <PlaceCard place={place} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next button */}
                <button className="h-min my-auto ml-4 z-10 bg-light-blue dark:bg-gray-700 text-black dark:text-white 
                border border-slate-400/60 p-2 rounded-full hover:bg-gray-200 focus:outline-none" onClick={nextSlide}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
