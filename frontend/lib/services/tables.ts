import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type Table = Database["public"]["Tables"]["tables"]["Row"]

/**
 * Obtiene todas las mesas
 */
export async function getAllTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .order("table_number", { ascending: true })

  if (error) {
    console.error("Error al obtener mesas:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene una mesa por su ID
 */
export async function getTableById(tableId: string): Promise<Table | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", tableId)
    .single()

  if (error) {
    console.error("Error al obtener mesa:", error)
    return null
  }

  return data
}

/**
 * Obtiene una mesa por su número
 */
export async function getTableByNumber(tableNumber: number): Promise<Table | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("table_number", tableNumber)
    .single()

  if (error) {
    console.error("Error al obtener mesa por número:", error)
    return null
  }

  return data
}

/**
 * Crea una nueva mesa
 */
export async function createTable(
  tableNumber: number,
  capacity: number,
  location?: string
): Promise<Table | null> {
  // Verificar si ya existe una mesa con ese número
  const { data: existingTable } = await supabase
    .from("tables")
    .select("id")
    .eq("table_number", tableNumber)
    .maybeSingle()

  if (existingTable) {
    console.error("Ya existe una mesa con ese número")
    return null
  }

  // Crear la mesa
  const { data, error } = await supabase
    .from("tables")
    .insert({
      table_number: tableNumber,
      capacity,
      status: "available",
      location
    })
    .select()
    .single()

  if (error) {
    console.error("Error al crear mesa:", error)
    return null
  }

  return data
}

/**
 * Actualiza una mesa existente
 */
export async function updateTable(
  tableId: string,
  updates: {
    table_number?: number
    capacity?: number
    status?: Table["status"]
    location?: string
  }
): Promise<Table | null> {
  // Si se está actualizando el número de mesa, verificar que no exista otra con ese número
  if (updates.table_number) {
    const { data: existingTable } = await supabase
      .from("tables")
      .select("id")
      .eq("table_number", updates.table_number)
      .neq("id", tableId)
      .maybeSingle()

    if (existingTable) {
      console.error("Ya existe otra mesa con ese número")
      return null
    }
  }

  // Actualizar la mesa
  const { data, error } = await supabase
    .from("tables")
    .update(updates)
    .eq("id", tableId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar mesa:", error)
    return null
  }

  return data
}

/**
 * Elimina una mesa
 */
export async function deleteTable(tableId: string): Promise<boolean> {
  // Verificar si hay reservas asociadas a esta mesa
  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("id")
    .eq("table_id", tableId)
    .limit(1)

  if (reservationsError) {
    console.error("Error al verificar reservas:", reservationsError)
    return false
  }

  if (reservations && reservations.length > 0) {
    console.error("No se puede eliminar la mesa porque tiene reservas asociadas")
    return false
  }

  // Eliminar la mesa
  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", tableId)

  if (error) {
    console.error("Error al eliminar mesa:", error)
    return false
  }

  return true
}

/**
 * Actualiza el estado de una mesa
 */
export async function updateTableStatus(
  tableId: string,
  status: Table["status"]
): Promise<Table | null> {
  const { data, error } = await supabase
    .from("tables")
    .update({ status })
    .eq("id", tableId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar estado de la mesa:", error)
    return null
  }

  return data
}

/**
 * Obtiene las mesas disponibles
 */
export async function getAvailableTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("status", "available")
    .order("table_number", { ascending: true })

  if (error) {
    console.error("Error al obtener mesas disponibles:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene las mesas ocupadas
 */
export async function getOccupiedTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("status", "occupied")
    .order("table_number", { ascending: true })

  if (error) {
    console.error("Error al obtener mesas ocupadas:", error)
    throw error
  }

  return data || []
}
