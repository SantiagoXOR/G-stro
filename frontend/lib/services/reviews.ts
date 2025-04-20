import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type ReviewReaction = Database["public"]["Tables"]["review_reactions"]["Row"]

/**
 * Obtiene las reseñas de un producto
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener reseñas del producto:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene las reseñas de un usuario
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, product:products(name, image_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener reseñas del usuario:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene una reseña específica
 */
export async function getReview(reviewId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name, avatar_url), product:products(name, image_url)")
    .eq("id", reviewId)
    .single()

  if (error) {
    console.error("Error al obtener reseña:", error)
    return null
  }

  return data
}

/**
 * Crea una nueva reseña
 */
export async function createReview(
  userId: string,
  productId: string,
  orderId: string | null,
  rating: number,
  comment?: string,
  images?: string[]
): Promise<Review | null> {
  // Verificar si el usuario ya ha reseñado este producto
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existingReview) {
    console.error("El usuario ya ha reseñado este producto")
    return null
  }

  // Crear la reseña
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      rating,
      comment,
      images,
      is_verified: !!orderId, // Verificada si está asociada a un pedido
      is_published: true
    })
    .select()
    .single()

  if (error) {
    console.error("Error al crear reseña:", error)
    return null
  }

  return data
}

/**
 * Actualiza una reseña existente
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  updates: {
    rating?: number
    comment?: string
    images?: string[]
  }
): Promise<Review | null> {
  // Verificar que la reseña pertenece al usuario
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single()

  if (!existingReview) {
    console.error("La reseña no existe o no pertenece al usuario")
    return null
  }

  // Actualizar la reseña
  const { data, error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", reviewId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar reseña:", error)
    return null
  }

  return data
}

/**
 * Elimina una reseña
 */
export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  // Verificar que la reseña pertenece al usuario
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single()

  if (!existingReview) {
    console.error("La reseña no existe o no pertenece al usuario")
    return false
  }

  // Eliminar la reseña
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)

  if (error) {
    console.error("Error al eliminar reseña:", error)
    return false
  }

  return true
}

/**
 * Añade una reacción a una reseña
 */
export async function addReviewReaction(
  reviewId: string,
  userId: string,
  reactionType: string
): Promise<ReviewReaction | null> {
  // Verificar si ya existe una reacción
  const { data: existingReaction } = await supabase
    .from("review_reactions")
    .select("id, reaction_type")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle()

  // Si ya existe una reacción del mismo tipo, eliminarla (toggle)
  if (existingReaction && existingReaction.reaction_type === reactionType) {
    const { error } = await supabase
      .from("review_reactions")
      .delete()
      .eq("id", existingReaction.id)

    if (error) {
      console.error("Error al eliminar reacción:", error)
      return null
    }

    return null
  }

  // Si existe una reacción de otro tipo, actualizarla
  if (existingReaction) {
    const { data, error } = await supabase
      .from("review_reactions")
      .update({ reaction_type: reactionType })
      .eq("id", existingReaction.id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar reacción:", error)
      return null
    }

    return data
  }

  // Si no existe, crear una nueva reacción
  const { data, error } = await supabase
    .from("review_reactions")
    .insert({
      review_id: reviewId,
      user_id: userId,
      reaction_type: reactionType
    })
    .select()
    .single()

  if (error) {
    console.error("Error al crear reacción:", error)
    return null
  }

  return data
}

/**
 * Obtiene las reacciones de una reseña
 */
export async function getReviewReactions(reviewId: string): Promise<{ [key: string]: number }> {
  const { data, error } = await supabase
    .from("review_reactions")
    .select("reaction_type")
    .eq("review_id", reviewId)

  if (error) {
    console.error("Error al obtener reacciones:", error)
    return {}
  }

  // Contar reacciones por tipo
  const counts: { [key: string]: number } = {}
  data.forEach(reaction => {
    const type = reaction.reaction_type
    counts[type] = (counts[type] || 0) + 1
  })

  return counts
}

/**
 * Verifica si un usuario ha reaccionado a una reseña
 */
export async function getUserReaction(
  reviewId: string,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("review_reactions")
    .select("reaction_type")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data.reaction_type
}
