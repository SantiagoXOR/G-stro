"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

const promotions = [
  {
    id: 1,
    title: "2x1 en Pizzas",
    description: "Todos los martes y jueves",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    discount: "2x1",
    color: "bg-peach-cream-500",
  },
  {
    id: 2,
    title: "Happy Hour",
    description: "Bebidas con 30% off de 18 a 20hs",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1964&auto=format&fit=crop",
    discount: "30% OFF",
    color: "bg-bush-600",
  },
  {
    id: 3,
    title: "Combo Familiar",
    description: "4 milanesas + papas + bebida",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop",
    discount: "¡PROMO!",
    color: "bg-bush-500",
  },
]

export default function PromotionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToPromotion = (index: number) => {
    if (!containerRef.current) return

    if (index < 0) {
      index = promotions.length - 1
    } else if (index >= promotions.length) {
      index = 0
    }

    setCurrentIndex(index)

    const scrollAmount = index * (containerRef.current.offsetWidth * 0.85 + 16)
    containerRef.current.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  if (!isMounted) {
    return <div className="h-40 bg-muted animate-pulse rounded-xl"></div>
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {promotions.map((promo, index) => (
          <Card key={promo.id} className="min-w-[85%] flex-shrink-0 overflow-hidden promotion-card snap-center">
            <CardContent className="p-0">
              <div className="relative h-40">
                <Image src={promo.image || "/placeholder.svg"} alt={promo.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <Badge className={`${promo.color} mb-2 self-start text-peach-cream-50`}>{promo.discount}</Badge>
                  <h3 className="text-peach-cream-50 text-lg font-bold">{promo.title}</h3>
                  <p className="text-peach-cream-50/90 text-sm">{promo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md h-8 w-8 bg-bush-100 text-bush-800 hover:bg-bush-200"
        onClick={() => scrollToPromotion(currentIndex - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md h-8 w-8 bg-bush-100 text-bush-800 hover:bg-bush-200"
        onClick={() => scrollToPromotion(currentIndex + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="flex justify-center gap-1 mt-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${currentIndex === index ? "w-4 bg-bush-600" : "w-2 bg-muted"}`}
            onClick={() => scrollToPromotion(index)}
          />
        ))}
      </div>
    </div>
  )
}

