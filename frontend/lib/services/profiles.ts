import { getSupabaseClient } from "@/lib/supabase-client"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../../../shared/types/database.types"

/**
 * Cliente de Supabase con service role para operaciones de perfiles
 * Necesario porque usamos Clerk para autenticación, no Supabase Auth
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️ Configuración de Supabase Service Role no disponible")
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

/**
 * Obtiene el perfil del usuario actual
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    console.log(`🔍 Obteniendo perfil para usuario: ${userId}`)

    // Intentar primero con cliente normal
    let supabase = await getSupabaseClient()
    if (!supabase) {
      console.warn("⚠️ Cliente de Supabase no disponible, intentando con service role")
      supabase = getSupabaseServiceClient()
      if (!supabase) {
        console.error("❌ No se pudo obtener ningún cliente de Supabase")
        return null
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      // Si el perfil no existe (PGRST116), es un comportamiento normal
      if (error?.code === 'PGRST116') {
        console.log(`ℹ️ Perfil no encontrado para usuario ${userId}, se puede crear`)
        return null
      }

      // Para otros errores, hacer logging detallado
      const errorInfo = {
        code: error?.code || 'UNKNOWN',
        message: error?.message || 'Error desconocido',
        details: error?.details || null,
        hint: error?.hint || null,
        userId: userId
      }

      console.error("❌ Error al obtener perfil de usuario:", errorInfo)

      // Si hay error de RLS, intentar con service client
      if (error?.code === '42501' && supabase !== getSupabaseServiceClient()) {
        console.log(`🔑 Error de RLS, intentando con service role...`)
        const serviceClient = getSupabaseServiceClient()
        if (serviceClient) {
          const { data: serviceData, error: serviceError } = await serviceClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

          if (!serviceError) {
            console.log(`✅ Perfil obtenido con service role para usuario: ${userId}`)
            return serviceData
          }
        }
      }

      return null
    }

    console.log(`✅ Perfil obtenido exitosamente para usuario: ${userId}`)
    return data
  } catch (error) {
    console.error("Error inesperado al obtener perfil:", {
      error: error,
      userId: userId,
      stack: error instanceof Error ? error.stack : 'No stack available'
    })
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
  try {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.warn("⚠️ Cliente de Supabase no disponible")
      return null
    }

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
  } catch (error) {
    console.error("Error inesperado al actualizar perfil:", error)
    return null
  }
}

/**
 * Obtiene todos los perfiles (solo para administradores)
 */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.warn("⚠️ Cliente de Supabase no disponible")
      return []
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("email")

    if (error) {
      console.error("Error al obtener todos los perfiles:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener perfiles:", error)
    return []
  }
}

/**
 * Actualiza el rol de un usuario (solo para administradores)
 */
export async function updateUserRole(
  userId: string,
  role: Profile["role"]
): Promise<Profile | null> {
  try {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.warn("⚠️ Cliente de Supabase no disponible")
      return null
    }

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
  } catch (error) {
    console.error("Error inesperado al actualizar rol:", error)
    return null
  }
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
    console.log(`🔨 Creando perfil para usuario: ${userId}`, {
      email,
      name,
      role
    })

    // Para crear perfiles, usar service client ya que usamos Clerk para auth
    let supabase = getSupabaseServiceClient()
    if (!supabase) {
      console.warn("⚠️ Service client no disponible, intentando con cliente normal")
      supabase = await getSupabaseClient()
      if (!supabase) {
        console.error("❌ No se pudo obtener ningún cliente de Supabase")
        return null
      }
    }

    const profileData = {
      id: userId,
      email,
      name: name || null,
      role
    }

    console.log(`📝 Insertando perfil con datos:`, profileData)

    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single()

    if (error) {
      console.error("Error al crear perfil de usuario:", {
        code: error?.code || 'UNKNOWN',
        message: error?.message || 'Error desconocido',
        details: error?.details || null,
        hint: error?.hint || null,
        profileData: profileData,
        fullError: error
      })

      // Si el perfil ya existe, intentar obtenerlo
      if (error?.code === '23505') { // Unique violation
        console.log(`ℹ️ Perfil ya existe para usuario ${userId}, intentando obtenerlo`)
        return await getUserProfile(userId)
      }

      // Si hay error de RLS y no estamos usando service client, intentar con service client
      if (error?.code === '42501' && supabase !== getSupabaseServiceClient()) {
        console.log(`🔑 Error de RLS, intentando con service role...`)
        const serviceClient = getSupabaseServiceClient()
        if (serviceClient) {
          const { data: serviceData, error: serviceError } = await serviceClient
            .from("profiles")
            .insert([profileData])
            .select()
            .single()

          if (!serviceError) {
            console.log(`✅ Perfil creado con service role para usuario: ${userId}`)
            return serviceData
          } else if (serviceError?.code === '23505') {
            return await getUserProfile(userId)
          }
        }
      }

      return null
    }

    console.log(`✅ Perfil creado exitosamente para usuario: ${userId}`)
    return data
  } catch (error) {
    console.error("Error inesperado al crear perfil:", {
      error: error,
      userId: userId,
      email: email,
      stack: error instanceof Error ? error.stack : 'No stack available'
    })
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
    console.log(`🔄 getOrCreateUserProfile iniciado para usuario: ${userId}`)

    // Verificar parámetros
    if (!userId || !email) {
      console.error("Error: Parámetros inválidos", { userId, email })
      return null
    }

    // Intentar obtener el perfil existente
    console.log(`🔍 Buscando perfil existente...`)
    const existingProfile = await getUserProfile(userId)

    // Si el perfil existe, devolverlo
    if (existingProfile) {
      console.log(`✅ Perfil existente encontrado para usuario: ${userId}`)
      return existingProfile
    }

    // Si no existe, intentar crearlo
    console.log(`🔨 Perfil no encontrado, creando nuevo perfil...`)
    const newProfile = await createUserProfile(userId, email, name, role)

    if (newProfile) {
      console.log(`✅ Nuevo perfil creado exitosamente para usuario: ${userId}`)
      return newProfile
    } else {
      console.error(`❌ No se pudo crear el perfil para usuario: ${userId}`)
      return null
    }
  } catch (error) {
    console.error("Error crítico en getOrCreateUserProfile:", {
      error: error,
      userId: userId,
      email: email,
      stack: error instanceof Error ? error.stack : 'No stack available'
    })
    return null
  }
}
