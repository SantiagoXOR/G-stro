import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

/**
 * Obtiene el perfil del usuario actual
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
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
  } catch (error) {
    console.error("Error inesperado al obtener perfil:", error)
    return null
  }
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

/**
 * Crea un perfil para un usuario
 */
export async function createUserProfile(
  userId: string,
  email: string,
  name?: string,
  role: Database["public"]["Enums"]["user_role"] = "customer"
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email,
          name: name || null,
          role
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear perfil de usuario:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error inesperado al crear perfil:", error)
    return null
  }
}

/**
 * Obtiene o crea un perfil para un usuario
 * Si el perfil no existe, lo crea con la información proporcionada
 */
export async function getOrCreateUserProfile(
  userId: string,
  email: string,
  name?: string,
  role: Database["public"]["Enums"]["user_role"] = "customer"
): Promise<Profile | null> {
  try {
    // Intentar obtener el perfil
    const profile = await getUserProfile(userId)

    // Si el perfil existe, devolverlo
    if (profile) {
      return profile
    }

    // Si no existe, crearlo
    return await createUserProfile(userId, email, name, role)
  } catch (error) {
    console.error("Error en getOrCreateUserProfile:", error)
    return null
  }
}
