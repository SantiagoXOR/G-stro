"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon, Star, History, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

// Mock data
const menuItems = [
  {
    id: "milanesa",
    name: "Milanesa Napolitana",
    description: "Milanesa de ternera con salsa de tomate, jamón y queso, acompañada de papas fritas.",
    price: 3800,
    image: "https://images.unsplash.com/photo-1619221882266-0a6b9e6817c6?q=80&w=1964&auto=format&fit=crop",
    rating: 4.9,
    category: "principales",
  },
  {
    id: "asado",
    name: "Asado de Tira",
    description: "Tierno asado de tira a la parrilla con chimichurri casero.",
    price: 4500,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=2070&auto=format&fit=crop",
    rating: 4.8,
    category: "parrilla",
  },
  {
    id: "empanadas",
    name: "Empanadas (6 unidades)",
    description: "Empanadas de carne cortada a cuchillo, pollo y jamón y queso.",
    price: 2800,
    image: "https://images.unsplash.com/photo-1609525313344-a56f10b10bdd?q=80&w=1980&auto=format&fit=crop",
    rating: 4.7,
    category: "entradas",
  },
  {
    id: "provoleta",
    name: "Provoleta",
    description: "Queso provolone a la parrilla con orégano y aceite de oliva.",
    price: 2500,
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=1964&auto=format&fit=crop",
    rating: 4.6,
    category: "entradas",
  },
  {
    id: "flan",
    name: "Flan Casero",
    description: "Flan con dulce de leche y crema.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1624454002302-52288312a7ae?q=80&w=1974&auto=format&fit=crop",
    rating: 4.9,
    category: "postres",
  },
]

const recentSearches = ["milanesa", "asado", "empanadas", "pizza"]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchHistory, setSearchHistory] = useState(recentSearches)

  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query && !searchHistory.includes(query)) {
      setSearchHistory([query, ...searchHistory.slice(0, 4)])
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  const removeSearchTerm = (term: string) => {
    setSearchHistory(searchHistory.filter((item) => item !== term))
  }

  return (
    <div className="flex flex-col">
      <Header title="Buscar" />

      <div className="p-4">

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar platos, ingredientes..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!searchQuery && searchHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Búsquedas Recientes</h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Borrar
            </Button>
          </div>
          <div className="space-y-2">
            {searchHistory.map((term) => (
              <div key={term} className="flex items-center justify-between p-3 rounded-lg border">
                <button className="flex items-center flex-1" onClick={() => handleSearch(term)}>
                  <History className="h-4 w-4 text-muted-foreground mr-3" />
                  <span>{term}</span>
                </button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSearchTerm(term)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && (
        <div>
          <h2 className="text-lg font-medium mb-3">Resultados</h2>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Link href={`/menu/${item.id}`} key={item.id}>
                  <Card className="food-card">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-bold text-primary">${item.price.toLocaleString()}</span>
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
          )}
        </div>
      )}
      </div>
    </div>
  )
}

