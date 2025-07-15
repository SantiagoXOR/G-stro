import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, QrCode, Star, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[45vh] w-full">
        <Image
          src="/resources/Slainte.png"
          alt="Deliciosos platos argentinos"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h1 className="text-4xl font-bold mb-2 text-peach-cream-100">Gëstro</h1>
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
            <span className="text-yellow-500">⭐</span>
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

      {/* Featured Gallery Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Nuestros Platos</h2>
        <div className="grid grid-cols-2 gap-3">
          {featuredDishes.map((dish, index) => (
            <div key={dish.id} className={`relative overflow-hidden rounded-lg ${index === 0 ? 'col-span-2 h-48' : 'h-32'}`}>
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                className="object-cover brightness-[0.8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-semibold text-white">{dish.name}</h3>
                <p className="text-peach-cream-100 text-sm opacity-90">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Promociones</h2>
        <div className="bg-gradient-to-r from-bush-600 to-bush-700 text-white p-4 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-peach-cream-200/20 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-peach-cream-200/20 rounded-full translate-y-8 -translate-x-8" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg">¡Promociones especiales!</h3>
            <p className="opacity-90">Descubre nuestras ofertas del día</p>
            <Badge className="mt-2 bg-peach-cream-100 text-bush-700 hover:bg-peach-cream-200">
              Ver ofertas
            </Badge>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Categorías</h2>
          <Link href="/menu" className="text-bush-600 font-medium flex items-center gap-1">
            Ver todo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/menu?category=${category.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-28">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover brightness-[0.8]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-center">{category.name}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Items Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Más Populares</h2>
          <Link href="/menu" className="text-bush-600 font-medium flex items-center gap-1">
            Ver todo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {popularItems.map((item) => (
            <Link key={item.id} href={`/menu/${item.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {item.stock && item.stock <= 5 && (
                      <Badge className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs">
                        Quedan {item.stock}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-bush-700">${item.price.toLocaleString()}</span>
                      <Button size="sm" className="bg-bush-600 hover:bg-bush-700 text-peach-cream-50">
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Restaurant Gallery Section */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4">Nuestro Restaurante</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/resources/Slainte.png"
              alt="Interior del restaurante"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/resources/Slainte2.png"
              alt="Ambiente del restaurante"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/about">
            <Button variant="outline" className="border-bush-600 text-bush-600 hover:bg-bush-50">
              Conoce más sobre nosotros
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Mock data con imágenes reales
const categories = [
  {
    id: "entradas",
    name: "Entradas",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.20_4d6ff5c6.jpg"
  },
  {
    id: "principales",
    name: "Platos Principales",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_a5a0a40e.jpg"
  },
  {
    id: "parrilla",
    name: "Parrilla",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_b26d93cb.jpg"
  },
  {
    id: "postres",
    name: "Postres",
    image: "/resources/Imagen de WhatsApp 2024-11-26 a las 09.26.25_29072b63.jpg"
  }
]

const featuredDishes = [
  {
    id: "featured-1",
    name: "Especialidad de la Casa",
    description: "Nuestro plato más solicitado",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_a5a0a40e.jpg"
  },
  {
    id: "featured-2",
    name: "Entrada Gourmet",
    description: "Perfecta para compartir",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.20_4d6ff5c6.jpg"
  },
  {
    id: "featured-3",
    name: "Parrilla Premium",
    description: "Cortes selectos",
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_b26d93cb.jpg"
  },
  {
    id: "featured-4",
    name: "Postre Artesanal",
    description: "Dulce final perfecto",
    image: "/resources/Imagen de WhatsApp 2024-11-26 a las 09.26.25_29072b63.jpg"
  }
]

const popularItems = [
  {
    id: "milanesa",
    name: "Milanesa Napolitana",
    description: "Milanesa de ternera con salsa de tomate, jamón y queso, acompañada de papas fritas.",
    price: 3800,
    rating: 4.9,
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_a5a0a40e.jpg"
  },
  {
    id: "asado",
    name: "Asado de Tira",
    description: "Tierno asado de tira a la parrilla con chimichurri casero.",
    price: 4500,
    rating: 4.8,
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.21_b26d93cb.jpg",
    stock: 5
  },
  {
    id: "empanadas",
    name: "Empanadas (6 unidades)",
    description: "Empanadas de carne cortada a cuchillo, pollo y jamón y queso.",
    price: 2800,
    rating: 4.7,
    image: "/resources/Imagen de WhatsApp 2024-11-23 a las 19.30.20_4d6ff5c6.jpg"
  }
]



