import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Clock, MapPin, Star, QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import PromotionCarousel from "@/components/promotion-carousel"
import Logo from "@/components/logo"
import AuthCodeHandler from "@/components/auth-code-handler"
import { AuthStatus } from "@/components/auth-status"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Componente para manejar el código de autenticación */}
      <AuthCodeHandler />
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1984&auto=format&fit=crop"
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
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-medium">4.8</span>
            <span className="text-muted-foreground ml-1">(324 reseñas)</span>
          </div>
          <Badge variant="outline" className="bg-bush-100 text-bush-800 border-bush-200">
            Abierto
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Av. Corrientes 1234, CABA</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>12:00 - 23:00 hs</span>
        </div>
      </div>

      {/* Promotions */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Promociones</h2>
          <Link href="/promotions" className="text-bush-600 hover:text-bush-700 flex items-center text-sm">
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <PromotionCarousel />
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-3">Categorías</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link href={`/menu?category=${category.id}`} key={category.id}>
              <Card className="overflow-hidden promotion-card">
                <div className="relative h-32">
                  <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <h3 className="text-white font-medium">{category.name}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Estado de Autenticación */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-3">Tu Cuenta</h2>
        <AuthStatus />
      </div>

      {/* Popular Items */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Más Populares</h2>
          <Link href="/menu" className="text-bush-600 hover:text-bush-700 flex items-center text-sm">
            Ver menú <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {popularItems.map((item) => (
            <Link href={`/menu/${item.id}`} key={item.id}>
              <Card className="food-card">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      {item.limited && (
                        <Badge className="absolute top-1 left-1 text-[10px] bg-peach-cream-500 text-peach-cream-50">Quedan {item.stock}</Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-bush-600">${item.price.toLocaleString()}</span>
                        {item.rating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="text-xs">{item.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const categories = [
  {
    id: "entradas",
    name: "Entradas",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=2074&auto=format&fit=crop",
  },
  {
    id: "principales",
    name: "Platos Principales",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: "parrilla",
    name: "Parrilla",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2031&auto=format&fit=crop",
  },
  {
    id: "postres",
    name: "Postres",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=2070&auto=format&fit=crop",
  },
]

const popularItems = [
  {
    id: "milanesa",
    name: "Milanesa Napolitana",
    description: "Milanesa de ternera con salsa de tomate, jamón y queso, acompañada de papas fritas.",
    price: 3800,
    image: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?q=80&w=2070&auto=format&fit=crop",
    rating: 4.9,
    limited: false,
  },
  {
    id: "asado",
    name: "Asado de Tira",
    description: "Tierno asado de tira a la parrilla con chimichurri casero.",
    price: 4500,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2031&auto=format&fit=crop",
    rating: 4.8,
    limited: true,
    stock: 5,
  },
  {
    id: "empanadas",
    name: "Empanadas (6 unidades)",
    description: "Empanadas de carne cortada a cuchillo, pollo y jamón y queso.",
    price: 2800,
    image: "https://images.unsplash.com/photo-1604467715878-83e57e8bc129?q=80&w=2068&auto=format&fit=crop",
    rating: 4.7,
    limited: false,
  },
]

