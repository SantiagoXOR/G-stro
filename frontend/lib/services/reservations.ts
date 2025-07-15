import { getSupabaseClient } from "@/lib/supabase-client"
import type { Database } from "../../../shared/types/database.types"

export type Reservation = Database["public"]["Tables"]["reservations"]["Row"]
export type Table = Database["public"]["Tables"]["tables"]["Row"]

// Helper function para obtener el cliente de Supabase de forma segura
async function getSupabase() {
  const client = await getSupabaseClient()
  if (!client) {
    throw new Error('Cliente de Supabase no disponible')
  }
  return client
}

/**
 * Obtiene todas las reservas del usuario actual
 */
export async function getUserReservations(userId: string): Promise<Reservation[]> {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from("reservations")
      .select("*, table:tables(*)")
      .eq("customer_id", userId)
      .order("reservation_date", { ascending: false })

    if (error) {
      console.error("Error al obtener reservas del usuario:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener reservas:", error)
    return []
  }
}

/**
 * Obtiene una reserva por su ID
 */
export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, table:tables(*)")
    .eq("id", reservationId)
    .single()

  if (error) {
    console.error("Error al obtener reserva:", error)
    return null
  }

  return data
}

/**
 * Obtiene todas las mesas disponibles para una fecha y hora específicas
 */
export async function getAvailableTables(date: string, startTime: string, endTime: string): Promise<Table[]> {
  // Primero obtenemos todas las mesas
  const { data: allTables, error: tablesError } = await supabase
    .from("tables")
    .select("*")
    .eq("status", "available")
    .order("table_number")

  if (tablesError) {
    console.error("Error al obtener mesas:", tablesError)
    throw tablesError
  }

  // Luego obtenemos las reservas para esa fecha y hora
  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("table_id")
    .eq("reservation_date", date)
    .in("status", ["pending", "confirmed"])
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

  if (reservationsError) {
    console.error("Error al obtener reservas:", reservationsError)
    throw reservationsError
  }

  // Filtramos las mesas que ya están reservadas
  const reservedTableIds = reservations?.map(r => r.table_id) || []
  const availableTables = allTables?.filter(table => !reservedTableIds.includes(table.id)) || []

  return availableTables
}

/**
 * Crea una nueva reserva
 */
export async function createReservation(reservation: Omit<Reservation, "id" | "created_at" | "updated_at">): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select()
    .single()

  if (error) {
    console.error("Error al crear reserva:", error)
    return null
  }

  return data
}

/**
 * Actualiza una reserva existente
 */
export async function updateReservation(
  reservationId: string,
  updates: Partial<Omit<Reservation, "id" | "created_at" | "updated_at">>
): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .update(updates)
    .eq("id", reservationId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar reserva:", error)
    return null
  }

  return data
}

/**
 * Cancela una reserva
 */
export async function cancelReservation(reservationId: string): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId)
    .in("status", ["pending", "confirmed"]) // Solo se pueden cancelar reservas pendientes o confirmadas
    .select()
    .single()

  if (error) {
    console.error("Error al cancelar reserva:", error)
    return null
  }

  return data
}
