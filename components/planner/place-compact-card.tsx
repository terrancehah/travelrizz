'use client'

import { useState } from 'react'
import { Grip, X, GripVertical } from 'lucide-react'
import { Place } from '@/managers/types'
import Image from 'next/image'
import { cn } from '@/utils/cn'

interface PlaceCardProps {
    place: Place
    onDelete: (id: string) => void
    dragHandleProps?: any
    className?: string
}

export function PlaceCompactCard({ place, onDelete, dragHandleProps, className }: PlaceCardProps) {
    const [imageLoading, setImageLoading] = useState(true)
    const displayName = typeof place.displayName === 'string' ? place.displayName : place.displayName.text
    const typeDisplay = place.primaryTypeDisplayName?.text || place.primaryType
    
    const photoUrl = place.photos?.[0]?.name
    ? `/api/places/photos?photoName=${place.photos[0].name}&maxWidth=400&maxHeight=192`
    : '/images/placeholder-image.jpg'
    
    return (
        <div className={cn("group flex w-full items-start md:items-center gap-3 rounded-lg bg-card dark:bg-gray-800 p-3 shadow-sm", className)}>
        {dragHandleProps && (
            <div {...dragHandleProps} className="text-gray-300 dark:text-gray-500">
            <GripVertical className="h-5 w-5" />
            </div>
        )}
        
        <div className="relative h-20 w-20 shrink-0 overflow-hidden my-auto rounded-md">
        {imageLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <Image
        src={photoUrl}
        alt={displayName}
        fill
        className={cn(
            "object-cover",
            imageLoading ? "opacity-0" : "opacity-100 transition-opacity duration-200"
        )}
        onLoad={() => setImageLoading(false)}
        onError={(e) => {
            setImageLoading(false)
            // @ts-ignore - src exists on HTMLImageElement
            e.currentTarget.src = '/images/placeholder-image.jpg'
        }}
        />
        </div>
        
        <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
        <div>
        <h3 className="font-medium text-base leading-none dark:text-gray-200">{displayName}</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">{typeDisplay}</p>
        </div>
        </div>
        <p className="text-xs text-muted-foreground dark:text-gray-400">{place.formattedAddress}</p>
        </div>
        <button
        onClick={() => onDelete(place.id)}
        className="invisible group-hover:visible shrink-0"
        aria-label="Delete place"
        >
        <X className="h-6 w-6 text-muted-foreground hover:text-destructive text-gray-300 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-600 hover:bg-red-600/40 dark:hover:bg-red-900/30 rounded-md" />
        </button>
        </div>
    )
}
