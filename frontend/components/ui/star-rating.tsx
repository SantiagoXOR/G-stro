"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  
  // Determinar tamaño de las estrellas
  const starSize = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  }[size]
  
  // Manejar clic en estrella
  const handleClick = (index: number) => {
    if (!interactive) return
    
    // Si se hace clic en la misma estrella, eliminar la calificación
    const newRating = rating === index ? 0 : index
    onChange?.(newRating)
  }
  
  // Manejar hover sobre estrella
  const handleMouseEnter = (index: number) => {
    if (!interactive) return
    setHoverRating(index)
  }
  
  // Manejar salida del hover
  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
  }
  
  // Renderizar estrellas
  return (
    <div 
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "transition-colors",
              isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
              interactive && "cursor-pointer"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        )
      })}
    </div>
  )
}
