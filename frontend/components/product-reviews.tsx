"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, MessageSquare, Flag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { getProductReviews, addReviewReaction, Review } from "@/lib/services/reviews"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProductReviewsProps {
  productId: string
  className?: string
}

export function ProductReviews({ productId, className = "" }: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<number | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        const data = await getProductReviews(productId)
        setReviews(data)
      } catch (error) {
        console.error("Error al cargar reseñas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  // Filtrar reseñas por calificación
  const filteredReviews = activeFilter
    ? reviews.filter(review => review.rating === activeFilter)
    : reviews

  // Calcular estadísticas
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length
      ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100
      : 0
  }))

  // Manejar reacción a una reseña
  const handleReaction = async (reviewId: string, reactionType: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para reaccionar a una reseña", {
        action: {
          label: "Iniciar Sesión",
          onClick: () => window.location.href = "/auth/login"
        }
      })
      return
    }

    try {
      await addReviewReaction(reviewId, user.id, reactionType)
      
      // Actualizar reseñas
      const updatedReviews = await getProductReviews(productId)
      setReviews(updatedReviews)
    } catch (error) {
      console.error("Error al reaccionar a la reseña:", error)
      toast.error("Error al reaccionar a la reseña")
    }
  }

  // Manejar envío de nueva reseña
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para dejar una reseña")
      return
    }

    if (newReview.rating < 1 || newReview.rating > 5) {
      toast.error("La calificación debe estar entre 1 y 5 estrellas")
      return
    }

    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para enviar la reseña
      // await createReview(user.id, productId, null, newReview.rating, newReview.comment)
      
      toast.success("Reseña enviada correctamente")
      setIsReviewDialogOpen(false)
      
      // Resetear formulario
      setNewReview({
        rating: 5,
        comment: ""
      })
      
      // Actualizar reseñas
      const updatedReviews = await getProductReviews(productId)
      setReviews(updatedReviews)
    } catch (error) {
      console.error("Error al enviar reseña:", error)
      toast.error("Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reseñas y Calificaciones</h2>
        <Button onClick={() => setIsReviewDialogOpen(true)}>Escribir Reseña</Button>
      </div>

      {/* Resumen de calificaciones */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-2">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <button
                      className={`text-sm font-medium w-12 ${
                        activeFilter === rating ? "text-primary" : ""
                      }`}
                      onClick={() => setActiveFilter(activeFilter === rating ? null : rating)}
                    >
                      {rating} {rating === 1 ? "★" : "★★★★★".substring(0, rating)}
                    </button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
        >
          Todas
        </Button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={activeFilter === rating ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(activeFilter === rating ? null : rating)}
          >
            {rating} {rating === 1 ? "estrella" : "estrellas"}
          </Button>
        ))}
      </div>

      {/* Lista de reseñas */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No hay reseñas</h3>
          <p className="text-muted-foreground mb-4">
            {activeFilter
              ? `No hay reseñas con ${activeFilter} ${
                  activeFilter === 1 ? "estrella" : "estrellas"
                }`
              : "Sé el primero en dejar una reseña para este producto"}
          </p>
          <Button onClick={() => setIsReviewDialogOpen(true)}>Escribir Reseña</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={(review.user as any)?.avatar_url || ""}
                        alt={(review.user as any)?.full_name || "Usuario"}
                      />
                      <AvatarFallback>
                        {((review.user as any)?.full_name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {(review.user as any)?.full_name || "Usuario"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: es
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-3">
                    <p className="text-sm">{review.comment}</p>
                  </div>
                )}

                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleReaction(review.id, "like")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    <span>Útil</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleReaction(review.id, "comment")}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    <span>Comentar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleReaction(review.id, "report")}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1" />
                    <span>Reportar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo para escribir reseña */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escribir Reseña</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con este producto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= newReview.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Tu opinión</Label>
              <Textarea
                id="comment"
                placeholder="Comparte tu experiencia con este producto..."
                rows={5}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Publicar Reseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
