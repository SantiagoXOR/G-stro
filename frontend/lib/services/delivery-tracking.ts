import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"

export type DeliveryDriver = Database["public"]["Tables"]["delivery_drivers"]["Row"]
export type DriverLocation = Database["public"]["Tables"]["driver_locations"]["Row"]
export type DeliveryEstimate = Database["public"]["Tables"]["delivery_estimates"]["Row"]

/**
 * Obtiene la ubicación actual del repartidor asignado a un pedido
 */
export async function getOrderDriverLocation(orderId: string): Promise<DriverLocation | null> {
  // Primero obtenemos el ID del repartidor asignado al pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("driver_id")
    .eq("id", orderId)
    .single()

  if (orderError || !order || !order.driver_id) {
    console.error("Error al obtener el repartidor del pedido:", orderError)
    return null
  }

  // Luego obtenemos la ubicación más reciente del repartidor
  const { data, error } = await supabase
    .from("driver_locations")
    .select("*")
    .eq("driver_id", order.driver_id)
    .eq("order_id", orderId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error al obtener ubicación del repartidor:", error)
    return null
  }

  return data
}

/**
 * Obtiene el historial de ubicaciones del repartidor para un pedido
 */
export async function getDriverLocationHistory(
  orderId: string,
  limit: number = 20
): Promise<DriverLocation[]> {
  // Primero obtenemos el ID del repartidor asignado al pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("driver_id")
    .eq("id", orderId)
    .single()

  if (orderError || !order || !order.driver_id) {
    console.error("Error al obtener el repartidor del pedido:", orderError)
    return []
  }

  // Luego obtenemos el historial de ubicaciones
  const { data, error } = await supabase
    .from("driver_locations")
    .select("*")
    .eq("driver_id", order.driver_id)
    .eq("order_id", orderId)
    .order("timestamp", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error al obtener historial de ubicaciones:", error)
    return []
  }

  return data || []
}

/**
 * Obtiene la estimación de entrega para un pedido
 */
export async function getDeliveryEstimate(orderId: string): Promise<DeliveryEstimate | null> {
  const { data, error } = await supabase
    .from("delivery_estimates")
    .select("*")
    .eq("order_id", orderId)
    .single()

  if (error) {
    console.error("Error al obtener estimación de entrega:", error)
    return null
  }

  return data
}

/**
 * Calcula el tiempo estimado de entrega
 * @returns Objeto con minutos estimados y hora estimada de entrega
 */
export function calculateEstimatedDeliveryTime(
  estimate: DeliveryEstimate | null,
  orderCreatedAt: string
): { minutes: number; estimatedTime: Date } {
  // Si tenemos una estimación precisa, la usamos
  if (estimate && estimate.estimated_delivery_time) {
    const estimatedTime = new Date(estimate.estimated_delivery_time)
    const now = new Date()
    const diffMs = estimatedTime.getTime() - now.getTime()
    const minutes = Math.max(0, Math.round(diffMs / 60000))
    
    return { minutes, estimatedTime }
  }
  
  // Si no, usamos una estimación básica (30-45 minutos desde la creación)
  const orderDate = new Date(orderCreatedAt)
  // Añadir entre 30 y 45 minutos según la hora del día
  const currentHour = new Date().getHours()
  
  // En horas pico (12-14 y 20-22) estimamos más tiempo
  let additionalMinutes = 30
  if ((currentHour >= 12 && currentHour <= 14) || (currentHour >= 20 && currentHour <= 22)) {
    additionalMinutes = 45
  }
  
  const estimatedTime = new Date(orderDate.getTime() + additionalMinutes * 60000)
  const now = new Date()
  const diffMs = estimatedTime.getTime() - now.getTime()
  const minutes = Math.max(0, Math.round(diffMs / 60000))
  
  return { minutes, estimatedTime }
}

/**
 * Suscribe a actualizaciones de ubicación del repartidor en tiempo real
 */
export function subscribeToDriverLocation(
  orderId: string,
  callback: (location: DriverLocation) => void
): { unsubscribe: () => void } {
  // Primero obtenemos el ID del repartidor asignado al pedido
  const getDriverId = async () => {
    const { data: order } = await supabase
      .from("orders")
      .select("driver_id")
      .eq("id", orderId)
      .single()
    
    return order?.driver_id
  }

  // Crear la suscripción
  const subscription = supabase
    .channel(`driver-location-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'driver_locations',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new as DriverLocation)
      }
    )
    .subscribe()

  // Devolver función para cancelar la suscripción
  return {
    unsubscribe: () => {
      subscription.unsubscribe()
    }
  }
}

/**
 * Simula el movimiento de un repartidor (para demostración)
 * Esta función crea ubicaciones simuladas para un repartidor
 */
export async function simulateDriverMovement(
  orderId: string,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  durationMinutes: number = 15
): Promise<boolean> {
  try {
    // Obtener el pedido y el repartidor
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("driver_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order || !order.driver_id) {
      console.error("Error al obtener el repartidor del pedido:", orderError)
      return false
    }

    const driverId = order.driver_id

    // Calcular puntos intermedios (simulación simple de línea recta)
    const steps = durationMinutes * 2 // Una actualización cada 30 segundos
    const latStep = (endLat - startLat) / steps
    const lngStep = (endLng - startLng) / steps

    // Crear la primera ubicación
    await supabase.from("driver_locations").insert({
      driver_id: driverId,
      order_id: orderId,
      latitude: startLat,
      longitude: startLng,
      accuracy: 10,
      heading: 0,
      speed: 0
    })

    // Simular movimiento (en un entorno real, esto vendría del dispositivo del repartidor)
    for (let i = 1; i <= steps; i++) {
      // En un entorno real, esto sería un proceso continuo
      // Aquí lo simulamos con un retraso
      await new Promise(resolve => setTimeout(resolve, 500))

      const lat = startLat + latStep * i
      const lng = startLng + lngStep * i
      
      // Calcular heading (dirección) y speed (velocidad)
      const heading = Math.round(Math.atan2(latStep, lngStep) * 180 / Math.PI)
      const speed = Math.random() * 10 + 10 // Entre 10 y 20 km/h

      // Insertar nueva ubicación
      await supabase.from("driver_locations").insert({
        driver_id: driverId,
        order_id: orderId,
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        heading,
        speed
      })
    }

    return true
  } catch (error) {
    console.error("Error al simular movimiento del repartidor:", error)
    return false
  }
}
