"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const promotions = [
  {
    id: "happy-hour",
    title: "Happy Hour",
    description: "Bebidas con 30% off de 18 a 20hs",
    longDescription:
      "Disfrutá de todas nuestras bebidas con un 30% de descuento de lunes a jueves de 18 a 20hs. Incluye cervezas, tragos, gaseosas y vinos por copa.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1964&auto=format&fit=crop",
    discount: "30% OFF",
    color: "bg-green-600",
    validUntil: "31/05/2025",
    conditions: [
      "Válido de lunes a jueves de 18:00 a 20:00hs",
      "No acumulable con otras promociones",
      "No válido para delivery",
    ],
    items: [
      { name: "Cerveza tirada", originalPrice: 1500, discountedPrice: 1050 },
      { name: "Fernet con Coca", originalPrice: 2000, discountedPrice: 1400 },
      { name: "Copa de vino", originalPrice: 1800, discountedPrice: 1260 },
      { name: "Gaseosas", originalPrice: 1000, discountedPrice: 700 },
    ],
  },
  {
    id: "2x1-pizzas",
    title: "2x1 en Pizzas",
    description: "Todos los martes y jueves",
    longDescription:
      "Llevate 2 pizzas medianas por el precio de 1. Válido todos los martes y jueves, en todas nuestras variedades de pizzas medianas.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    discount: "2x1",
    color: "bg-orange-500",
    validUntil: "31/05/2025",
    conditions: ["Válido solo martes y jueves", "Válido para pizzas medianas", "Válido para delivery y take away"],
    items: [
      { name: "Pizza Mozzarella", originalPrice: 4500, discountedPrice: 2250 },
      { name: "Pizza Napolitana", originalPrice: 5000, discountedPrice: 2500 },
      { name: "Pizza Especial", originalPrice: 5500, discountedPrice: 2750 },
      { name: "Pizza Fugazzeta", originalPrice: 5200, discountedPrice: 2600 },
    ],
  },
  {
    id: "combo-familiar",
    title: "Combo Familiar",
    description: "4 milanesas + papas + bebida",
    longDescription:
      "Combo ideal para compartir en familia: 4 milanesas napolitanas con papas fritas + 1 gaseosa de 2 litros por un precio especial.",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop",
    discount: "¡PROMO!",
    color: "bg-blue-600",
    validUntil: "31/05/2025",
    conditions: ["Válido todos los días", "Válido para delivery y take away", "No acumulable con otras promociones"],
    items: [{ name: "Combo Familiar", originalPrice: 22000, discountedPrice: 18000 }],
  },
  {
    id: "menu-ejecutivo",
    title: "Menú Ejecutivo",
    description: "Entrada + plato principal + postre",
    longDescription:
      "Menú ejecutivo de lunes a viernes al mediodía. Incluye entrada a elección, plato principal y postre por un precio especial.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
    discount: "25% OFF",
    color: "bg-purple-600",
    validUntil: "31/05/2025",
    conditions: [
      "Válido de lunes a viernes de 12:00 a 15:00hs",
      "No válido para delivery",
      "No acumulable con otras promociones",
    ],
    items: [{ name: "Menú Ejecutivo", originalPrice: 8000, discountedPrice: 6000 }],
  },
]

export default function PromotionsPage() {
  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Promociones</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {promotions.map((promo) => (
          <Link href={`/promotions/${promo.id}`} key={promo.id}>
            <Card className="overflow-hidden promotion-card">
              <div className="relative h-40">
                <Image src={promo.image || "/placeholder.svg"} alt={promo.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <Badge className={`${promo.color} mb-2 self-start`}>{promo.discount}</Badge>
                  <h3 className="text-white text-lg font-bold">{promo.title}</h3>
                  <p className="text-white/90 text-sm">{promo.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

