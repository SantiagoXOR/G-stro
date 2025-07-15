/**
 * Utility functions for table management
 */

/**
 * Assign staff member to a table
 */
export function assignStaffToTable(table: any, staffId: string) {
  return {
    ...table,
    assigned_staff_id: staffId,
    updated_at: new Date().toISOString()
  }
}

/**
 * Calculate time table has been occupied
 */
export function getOccupiedTime(occupiedSince: string): string {
  const start = new Date(occupiedSince)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  return `${diffMinutes} min`
}

/**
 * Filter tables by status
 */
export function filterTablesByStatus(tables: any[], status: string) {
  return tables.filter(table => table.status === status)
}

/**
 * Get statistics about table statuses
 */
export function getTableStats(tables: any[]) {
  return {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
  }
}
