import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

/**
 * Obtiene el perfil del usuario actual
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error al obtener perfil de usuario:", error)
    return null
  }

  return data
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar perfil de usuario:", error)
    return null
  }

  return data
}

/**
 * Obtiene todos los perfiles (solo para administradores)
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("email")

  if (error) {
    console.error("Error al obtener todos los perfiles:", error)
    throw error
  }

  return data || []
}

/**
 * Actualiza el rol de un usuario (solo para administradores)
 */
export async function updateUserRole(
  userId: string,
  role: Profile["role"]
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar rol de usuario:", error)
    return null
  }

  return data
}
