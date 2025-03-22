'use client';

import { X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface PaymentSuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    showConfetti?: boolean;
}

export default function PaymentSuccessPopup({ isOpen, onClose, title, description, showConfetti = false }: PaymentSuccessPopupProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const animationFrameRef = useRef<number>();
    const tComp = useTranslations('components');
    const fonts = useLocalizedFont();
    
    // Configure autoplay plugin
    const autoplayOptions = {
        delay: 7000,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        rootNode: (emblaRoot: HTMLElement) => emblaRoot
    };
    
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, dragFree: true },     
        [Autoplay(autoplayOptions)]
    );
    
    
    const VIDEO_TUTORIALS = [
        {
            id: 1,
            title: tComp('paymentSuccessPopup.tutorials.visualisedRoutes.title'),
            src: "/images/visualised-routes.png",
            description: tComp('paymentSuccessPopup.tutorials.visualisedRoutes.description')
        },
        {
            id: 2,
            title: tComp('paymentSuccessPopup.tutorials.advancedDailyItinerary.title'),
            src: "/images/daily-itinerary-planning.png",
            description: tComp('paymentSuccessPopup.tutorials.advancedDailyItinerary.description')
        },
        {
            id: 3,
            title: tComp('paymentSuccessPopup.tutorials.travelTimeBetweenAttractions.title'),
            src: "/images/travel-info.png",
            description: tComp('paymentSuccessPopup.tutorials.travelTimeBetweenAttractions.description')
        },
        {
            id: 4,
            title: tComp('paymentSuccessPopup.tutorials.dragAndDropAttractionOrganising.title'),
            src: "/videos/drag-and-drop-place.mov",
            description: tComp('paymentSuccessPopup.tutorials.dragAndDropAttractionOrganising.description')
        },
        {
            id: 5,
            title: tComp('paymentSuccessPopup.tutorials.addAndRemoveAttractionsEasily.title'),
            src: "/videos/add-and-remove-place.mov",
            description: tComp('paymentSuccessPopup.tutorials.addAndRemoveAttractionsEasily.description')
        }
    ];
    
    
    
    useEffect(() => {
        if (!emblaApi) return;
        
        emblaApi.on('select', () => {
            setCurrentSlide(emblaApi.selectedScrollSnap());
        });
        
        return () => {
            emblaApi.destroy();
        };
    }, [emblaApi]);
    
    useEffect(() => {
        if (!isOpen || !showConfetti) return; // Only run when popup is open AND showConfetti is true
        
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#10b981', '#5cabfa', '#8b5cf6', '#d74776', '#fda010'];
        
        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
                zIndex: 10000
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
                zIndex: 10000
            });
            
            if (Date.now() < end) {
                animationFrameRef.current = requestAnimationFrame(frame);
            }
        };
        
        
        // Initial burst
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors: colors,
            zIndex: 10000
        });
        
        // Start continuous animation
        frame();
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            confetti.reset();
        };
    }, [isOpen, showConfetti]); // Only re-run when isOpen or showConfetti changes
    
    if (!isOpen) return null;
    
    
    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-[10000]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 px-6 max-w-3xl w-[80%] md:w-full mx-4 relative">
        {/* Close button */}
        <button
        onClick={onClose}
        className="absolute -top-2 -right-2 p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-slate-400 dark:hover:shadow-gray-900 shadow-md shadow-slate-500 dark:shadow-gray-900 transition-colors"
        aria-label="Close popup"
        >
        <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="space-y-6">
        
        <div className="text-center">
        <h3 className={`${fonts.text} text-2xl text-gray-700 dark:text-gray-300 font-semibold mb-2`}>{title}</h3>
        {description && <p className={`${fonts.text} text-lg text-gray-700 dark:text-gray-300`}>{description}</p>}
        </div>
        
        {/* Image Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
        {VIDEO_TUTORIALS.map((tutorial, index) => (
            <div key={tutorial.id} className="flex-[0_0_100%] min-w-0">
            <div className="p-2 flex flex-col items-center justify-center">
            {tutorial.src.endsWith('.mov') ? (
                <video
                className="w-[90%] rounded-lg border border-slate-200 dark:border-gray-700"
                src={tutorial.src}
                autoPlay
                loop
                muted
                playsInline
                />
            ) : (
                <img
                className="w-[90%] rounded-lg border border-slate-200 dark:border-gray-700"
                src={tutorial.src}
                alt={tutorial.title}
                />
            )}
            <h3 className={`text-gray-600 dark:text-gray-300 text-xl ${fonts.text} text-center font-bold mt-4 mb-2`}>{tutorial.title}</h3>
            <p className={`text-gray-600 dark:text-gray-400 ${fonts.text} text-center`}>{tutorial.description}</p>
            </div>
            </div>
        ))}
        </div>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
        {VIDEO_TUTORIALS.map((_, index) => (
            <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-500 dark:bg-sky-400' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
                />
            ))}
            </div>
            </div>
            </div>
            </div>
        );
    }
