"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getProductById, Product } from "@/lib/services/products"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductReviews } from "@/components/product-reviews"
import { SafeImage } from "@/components/safe-image"



export default function MenuItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const productData = await getProductById(params.id)
        setProduct(productData)
      } catch (error) {
        console.error("Error al cargar el producto:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        <Link href="/menu">
          <Button>Volver al Menú</Button>
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem(product, quantity, undefined, notes)
    toast.success("Producto agregado al carrito", {
      description: `${quantity} x ${product.name}`,
      action: {
        label: "Ver Carrito",
        onClick: () => router.push("/cart"),
      },
    })
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4">
        <div className="flex items-center justify-between mb-2">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative h-64 w-full">
        <SafeImage
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          priority
          fallbackSrc="/placeholder.svg"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <span className="text-xl font-bold text-primary">${Number(product.price).toLocaleString()}</span>
        </div>

        {/* Rating - Esto es un ejemplo, podrías implementarlo si tienes ratings en tu base de datos */}
        {/* <div className="flex items-center mb-4">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span className="font-medium">4.8</span>
          <span className="text-muted-foreground ml-1">(124 reseñas)</span>
        </div> */}

        <p className="text-muted-foreground mb-6">{product.description}</p>

        {/* Alcohol Content - Si es una bebida alcohólica */}
        {product.alcohol_percentage && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="text-sm">
              <span className="font-medium">Contenido de alcohol:</span> {product.alcohol_percentage}%
            </p>
          </div>
        )}



        {/* Notes */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Notas especiales</h3>
          <Textarea
            placeholder="Ej: Sin cebolla, salsa aparte, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
          />
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Cantidad</h3>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 font-medium text-lg">{quantity}</span>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 max-w-md mx-auto">
        <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={!product.is_available}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          {product.is_available ? "Agregar al Carrito" : "No Disponible"}
        </Button>
      </div>

      {/* Tabs para información adicional */}
      <div className="mt-8">
        <Tabs defaultValue="description">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Descripción</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reseñas</TabsTrigger>
            <TabsTrigger value="nutrition" className="flex-1">Información Nutricional</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <div className="prose prose-sm max-w-none">
              <p>{product.description || "No hay descripción disponible para este producto."}</p>

              {product.alcohol_percentage && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Contenido de alcohol</h4>
                  <p>{product.alcohol_percentage}%</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ProductReviews productId={product.id} />
          </TabsContent>
          <TabsContent value="nutrition" className="mt-4">
            <div className="prose prose-sm max-w-none">
              <p>Información nutricional no disponible.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

