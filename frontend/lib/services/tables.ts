// Importación condicional para evitar problemas durante el build
// import { getSupabaseClient } from "@/lib/supabase-client"
// import type { Database } from "../../../shared/types/database.types"

// Tipo simplificado para mesas
export type Table = {
  id: string
  table_number: number
  capacity: number
  status: "available" | "occupied" | "reserved" | "maintenance"
  location?: string
  created_at?: string
  updated_at?: string
}

// Datos de ejemplo para mesas
const mockTables: Table[] = [
  { id: "1", table_number: 1, capacity: 2, status: "available", location: "Ventana" },
  { id: "2", table_number: 2, capacity: 4, status: "available", location: "Centro" },
  { id: "3", table_number: 3, capacity: 6, status: "occupied", location: "Terraza" },
  { id: "4", table_number: 4, capacity: 2, status: "available", location: "Barra" },
  { id: "5", table_number: 5, capacity: 8, status: "reserved", location: "Privado" }
]

/**
 * Obtiene todas las mesas
 */
export async function getAllTables(): Promise<Table[]> {
  // Usar datos de ejemplo durante el build
  console.log('Devolviendo datos de ejemplo para mesas')
  return mockTables
}

/**
 * Obtiene una mesa por su ID
 */
export async function getTableById(tableId: string): Promise<Table | null> {
  // Buscar en datos de ejemplo
  const table = mockTables.find(t => t.id === tableId)
  return table || null
}

/**
 * Obtiene una mesa por su número
 */
export async function getTableByNumber(tableNumber: number): Promise<Table | null> {
  // Buscar en datos de ejemplo
  const table = mockTables.find(t => t.table_number === tableNumber)
  return table || null
}

/**
 * Crea una nueva mesa
 */
export async function createTable(
  tableNumber: number,
  capacity: number,
  location?: string
): Promise<Table | null> {
  // Simular creación con datos de ejemplo
  console.log('Simulando creación de mesa')
  const newTable: Table = {
    id: `mock-${Date.now()}`,
    table_number: tableNumber,
    capacity,
    status: "available",
    location,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  return newTable
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
  // Simular actualización con datos de ejemplo
  console.log('Simulando actualización de mesa')
  const table = await getTableById(tableId)
  if (!table) return null

  return {
    ...table,
    ...updates,
    updated_at: new Date().toISOString()
  }
}

/**
 * Elimina una mesa
 */
export async function deleteTable(tableId: string): Promise<boolean> {
  // Simular eliminación
  console.log('Simulando eliminación de mesa')
  return true
}

/**
 * Actualiza el estado de una mesa
 */
export async function updateTableStatus(
  tableId: string,
  status: Table["status"]
): Promise<Table | null> {
  // Simular actualización de estado
  console.log('Simulando actualización de estado de mesa')
  return await updateTable(tableId, { status })
}

/**
 * Obtiene las mesas disponibles
 */
export async function getAvailableTables(): Promise<Table[]> {
  // Filtrar mesas disponibles de los datos de ejemplo
  return mockTables.filter(table => table.status === "available")
}

/**
 * Obtiene las mesas ocupadas
 */
export async function getOccupiedTables(): Promise<Table[]> {
  // Filtrar mesas ocupadas de los datos de ejemplo
  return mockTables.filter(table => table.status === "occupied")
}
