'use client'

import React, { Component, ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary específico para funcionalidades de tiempo real
 * Maneja errores relacionados con Supabase Realtime de forma elegante
 */
export class RealtimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error para debugging
    console.warn('⚠️ Error en funcionalidad de tiempo real:', error)
    console.warn('⚠️ Información del error:', errorInfo)

    // Mostrar notificación al usuario
    toast.warning('Funcionalidad de tiempo real no disponible', {
      description: 'La aplicación funcionará en modo básico. Algunas notificaciones pueden no aparecer automáticamente.',
      duration: 5000
    })

    // Reportar error a servicio de monitoreo (si está configurado)
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderizar fallback UI
      return this.props.fallback || (
        <div className="hidden">
          {/* Error boundary activo - funcionalidad de tiempo real deshabilitada */}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook para verificar si las funcionalidades de tiempo real están disponibles
 */
export function useRealtimeStatus() {
  const [isAvailable, setIsAvailable] = React.useState(true)
  const [lastError, setLastError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Listener para errores de tiempo real
    const handleRealtimeError = (event: CustomEvent) => {
      setIsAvailable(false)
      setLastError(event.detail.message || 'Error desconocido')
      
      toast.warning('Tiempo real desconectado', {
        description: 'Reintentando conexión...',
        duration: 3000
      })
    }

    // Listener para reconexión exitosa
    const handleRealtimeReconnect = () => {
      setIsAvailable(true)
      setLastError(null)
      
      toast.success('Tiempo real reconectado', {
        description: 'Las notificaciones automáticas están funcionando nuevamente',
        duration: 3000
      })
    }

    window.addEventListener('realtime-error', handleRealtimeError as EventListener)
    window.addEventListener('realtime-reconnect', handleRealtimeReconnect as EventListener)

    return () => {
      window.removeEventListener('realtime-error', handleRealtimeError as EventListener)
      window.removeEventListener('realtime-reconnect', handleRealtimeReconnect as EventListener)
    }
  }, [])

  return { isAvailable, lastError }
}

/**
 * Función para reportar errores de tiempo real
 */
export function reportRealtimeError(error: Error | string) {
  const message = typeof error === 'string' ? error : error.message
  
  // Emitir evento personalizado
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('realtime-error', {
      detail: { message }
    }))
  }
}

/**
 * Función para reportar reconexión exitosa
 */
export function reportRealtimeReconnect() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('realtime-reconnect'))
  }
}

export default RealtimeErrorBoundary
