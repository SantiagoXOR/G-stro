"use client"

// Forzar renderizado dinámico para evitar problemas de prerendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Filter, Search, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getCategories, getProducts, Product, Category } from "@/lib/services/products"
import Header from "@/components/header"
import { SafeImage } from "@/components/safe-image"

const dietaryFilters = [
  { id: "vegetariano", name: "Vegetariano" },
  { id: "vegano", name: "Vegano" },
  { id: "sinGluten", name: "Sin Gluten" },
  { id: "sinLactosa", name: "Sin Lactosa" },
]

export default function MenuPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<(Category & { id: string })[]>([{ id: "all", name: "Todos" } as any])
  const [menuItems, setMenuItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Evitar problemas de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Obtener categorías
        const categoriesData = await getCategories()
        setCategories([{ id: "all", name: "Todos" } as any, ...categoriesData])

        // Obtener productos
        const productsData = await getProducts()
        setMenuItems(productsData)
      } catch (error) {
        console.error("Error al cargar datos del menú:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter((id) => id !== filterId))
    } else {
      setActiveFilters([...activeFilters, filterId])
    }
  }

  const filteredItems = menuItems.filter((item) => {
    // Category filter
    const categoryMatch = selectedCategory === "all" || item.category_id === selectedCategory

    // Search filter
    const searchMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    // Dietary filter - Nota: Esto es un ejemplo, necesitarías agregar un campo dietary a tu tabla de productos
    // const dietaryMatch = activeFilters.length === 0 || activeFilters.every((filter) => item.dietary?.includes(filter))
    const dietaryMatch = activeFilters.length === 0 // Por ahora, ignoramos los filtros dietarios

    return categoryMatch && searchMatch && dietaryMatch
  })

  if (!mounted) {
    return (
      <div className="flex flex-col">
        <Header title="Menú Digital" showBackButton />
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Menú Digital" showBackButton />

      <div className="px-4">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar platos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Preferencias dietarias</h3>
            <div className="flex flex-wrap gap-2">
              {dietaryFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter(filter.id)}
                >
                  {filter.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "category-pill whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando menú...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron platos que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Link href={`/menu/${item.id}`} key={item.id}>
                <Card className="food-card">
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          fallbackSrc="/placeholder.svg"
                        />
                        {!item.is_available && (
                          <Badge className="absolute top-1 left-1 text-[10px] bg-red-500">No disponible</Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold text-primary">${Number(item.price).toLocaleString()}</span>
                          {/* Aquí podrías agregar ratings si los tienes en tu base de datos */}
                        </div>
                        {/* Aquí podrías agregar badges de preferencias dietarias si las tienes en tu base de datos */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

