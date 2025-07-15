import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Clock, MapPin, Star, QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import PromotionCarousel from "@/components/promotion-carousel"
import Logo from "@/components/logo"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full">
        <Image
          src="/resources/Slainte.png"
          alt="Deliciosos platos argentinos"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-peach-cream-50">
          {/* Forzamos el uso del logo con color crema melocotón (#FAECD8) */}
          <Image
            src="/logo-complete.svg"
            alt="Gëstro Logo"
            width={180}
            height={48}
            className="object-contain mb-2"
          />
          <p className="text-lg mb-6 opacity-90">Los mejores platos de nuestra cocina</p>
          <div className="flex gap-2">
            <Link href="/menu" className="flex-1">
              <Button size="lg" className="w-full font-semibold bg-bush-600 hover:bg-bush-700 text-peach-cream-50">
                Ordenar Ahora
              </Button>
            </Link>
            <Link href="/scan">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-peach-cream-100 text-peach-cream-100 hover:bg-peach-cream-100/20">
                <QrCode className="h-5 w-5 mr-2" />
                Escanear Mesa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4 bg-white dark:bg-card shadow-sm rounded-b-xl -mt-4 relative z-10 mx-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <span className="font-semibold text-lg">4.8</span>
            <span className="text-muted-foreground">(324 reseñas)</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Abierto
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" />
          <span>Av. Corrientes 1234, CABA</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>12:00 - 23:00 hs</span>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Promociones</h2>
          <Link href="/promotions" className="flex items-center text-primary hover:underline">
            Ver todas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <PromotionCarousel />
      </div>

      {/* Categories Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/menu?category=${category.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-24">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-center">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Items Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Más Populares</h2>
          <Link href="/menu" className="flex items-center text-primary hover:underline">
            Ver menú
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {popularItems.map((item) => (
            <Link key={item.id} href={`/menu/${item.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {item.stock && item.stock <= 5 && (
                      <Badge className="absolute top-1 left-1 z-10 bg-orange-500 text-white text-xs">
                        Quedan {item.stock}
                      </Badge>
                    )}
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-3">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">${item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data
const categories = [
  {
    id: "entradas",
    name: "Entradas",
    image: "/resources/entradas.jpg"
  },
  {
    id: "principales",
    name: "Platos Principales",
    image: "/resources/principales.jpg"
  },
  {
    id: "parrilla",
    name: "Parrilla",
    image: "/resources/parrilla.jpg"
  },
  {
    id: "postres",
    name: "Postres",
    image: "/resources/postres.jpg"
  }
]

const popularItems = [
  {
    id: "milanesa",
    name: "Milanesa Napolitana",
    description: "Milanesa de ternera con salsa de tomate, jamón y queso, acompañada de papas fritas.",
    price: 3800,
    rating: 4.9,
    image: "/resources/milanesa.jpg"
  },
  {
    id: "asado",
    name: "Asado de Tira",
    description: "Tierno asado de tira a la parrilla con chimichurri casero.",
    price: 4500,
    rating: 4.8,
    image: "/resources/asado.jpg",
    stock: 5
  },
  {
    id: "empanadas",
    name: "Empanadas (6 unidades)",
    description: "Empanadas de carne cortada a cuchillo, pollo y jamón y queso.",
    price: 2800,
    rating: 4.7,
    image: "/resources/empanadas.jpg"
  }
]
