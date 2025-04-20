import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]

/**
 * Obtiene todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error al obtener categorías:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene todos los productos
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("name")

  if (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .order("name")

  if (error) {
    console.error("Error al obtener productos por categoría:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error al obtener producto:", error)
    return null
  }

  return data
}

/**
 * Busca productos por nombre o descripción
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("name")

  if (error) {
    console.error("Error al buscar productos:", error)
    throw error
  }

  return data || []
}

/**
 * Crea un nuevo producto (solo para administradores)
 */
export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error("Error al crear producto:", error)
    throw error
  }

  return data
}

/**
 * Actualiza un producto existente (solo para administradores)
 */
export async function updateProduct(id: string, updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar producto:", error)
    throw error
  }

  return data
}

/**
 * Elimina un producto (solo para administradores)
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}
