/**
 * Sistema de monitoreo de Fast Refresh para detectar y prevenir errores
 * Este módulo ayuda a mantener un entorno de desarrollo estable
 */

'use client'

interface FastRefreshError {
  timestamp: number
  message: string
  stack?: string
  component?: string
  type: 'warning' | 'error' | 'info'
}

class FastRefreshMonitor {
  private errors: FastRefreshError[] = []
  private listeners: ((error: FastRefreshError) => void)[] = []
  private isMonitoring = false
  private originalConsoleError: typeof console.error
  private originalConsoleWarn: typeof console.warn

  constructor() {
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
  }

  start() {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.isMonitoring = true
    console.log('🔍 Fast Refresh Monitor iniciado')

    // Interceptar errores de consola relacionados con Fast Refresh
    console.error = (...args) => {
      this.originalConsoleError(...args)
      this.handleConsoleMessage('error', args)
    }

    console.warn = (...args) => {
      this.originalConsoleWarn(...args)
      this.handleConsoleMessage('warning', args)
    }

    // Escuchar errores no capturados
    window.addEventListener('error', this.handleWindowError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)

    // Monitorear cambios en el DOM que puedan indicar recargas completas
    this.monitorDOMChanges()
  }

  stop() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    console.log('🛑 Fast Refresh Monitor detenido')

    // Restaurar funciones originales
    console.error = this.originalConsoleError
    console.warn = this.originalConsoleWarn

    // Remover listeners
    window.removeEventListener('error', this.handleWindowError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  private handleConsoleMessage = (type: 'error' | 'warning', args: any[]) => {
    const message = args.join(' ')
    
    // Detectar mensajes relacionados con Fast Refresh
    const fastRefreshPatterns = [
      /Fast Refresh had to perform a full reload/i,
      /Cannot update a component.*while rendering a different component/i,
      /Warning: Cannot update during an existing state transition/i,
      /Warning: Maximum update depth exceeded/i,
      /Warning: Each child in a list should have a unique "key" prop/i,
      /Warning: React Hook.*has a missing dependency/i,
      /Warning: React Hook.*was passed a dependency list/i
    ]

    const isRelevant = fastRefreshPatterns.some(pattern => pattern.test(message))
    
    if (isRelevant) {
      const error: FastRefreshError = {
        timestamp: Date.now(),
        message,
        type: type === 'error' ? 'error' : 'warning'
      }

      this.addError(error)
    }
  }

  private handleWindowError = (event: ErrorEvent) => {
    const error: FastRefreshError = {
      timestamp: Date.now(),
      message: event.message,
      stack: event.error?.stack,
      type: 'error'
    }

    this.addError(error)
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error: FastRefreshError = {
      timestamp: Date.now(),
      message: `Unhandled Promise Rejection: ${event.reason}`,
      type: 'error'
    }

    this.addError(error)
  }

  private monitorDOMChanges() {
    let lastReloadTime = 0
    const reloadThreshold = 1000 // 1 segundo

    const observer = new MutationObserver(() => {
      const now = Date.now()
      if (now - lastReloadTime > reloadThreshold) {
        lastReloadTime = now
        
        // Verificar si hubo una recarga completa
        const bodyElement = document.body
        if (bodyElement && bodyElement.children.length === 0) {
          const error: FastRefreshError = {
            timestamp: now,
            message: 'Posible recarga completa detectada - Fast Refresh falló',
            type: 'warning'
          }
          
          this.addError(error)
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private addError(error: FastRefreshError) {
    this.errors.push(error)
    
    // Mantener solo los últimos 50 errores
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50)
    }

    // Notificar a los listeners
    this.listeners.forEach(listener => listener(error))

    // Log específico para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const icon = error.type === 'error' ? '❌' : '⚠️'
      console.group(`${icon} Fast Refresh Monitor`)
      console.log('Tipo:', error.type)
      console.log('Mensaje:', error.message)
      console.log('Timestamp:', new Date(error.timestamp).toLocaleTimeString())
      if (error.stack) {
        console.log('Stack:', error.stack)
      }
      console.groupEnd()
    }
  }

  getErrors(): FastRefreshError[] {
    return [...this.errors]
  }

  getRecentErrors(minutes: number = 5): FastRefreshError[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.errors.filter(error => error.timestamp > cutoff)
  }

  clearErrors() {
    this.errors = []
  }

  onError(listener: (error: FastRefreshError) => void) {
    this.listeners.push(listener)
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getStats() {
    const recent = this.getRecentErrors()
    const errors = recent.filter(e => e.type === 'error')
    const warnings = recent.filter(e => e.type === 'warning')

    return {
      total: this.errors.length,
      recent: recent.length,
      errors: errors.length,
      warnings: warnings.length,
      isHealthy: recent.length === 0
    }
  }
}

// Instancia singleton
export const fastRefreshMonitor = new FastRefreshMonitor()

// Hook para usar en componentes React
export function useFastRefreshMonitor() {
  const [stats, setStats] = useState(fastRefreshMonitor.getStats())
  const [recentErrors, setRecentErrors] = useState<FastRefreshError[]>([])

  useEffect(() => {
    // Iniciar monitoreo
    fastRefreshMonitor.start()

    // Actualizar stats cada 5 segundos
    const interval = setInterval(() => {
      setStats(fastRefreshMonitor.getStats())
      setRecentErrors(fastRefreshMonitor.getRecentErrors())
    }, 5000)

    // Listener para errores en tiempo real
    const unsubscribe = fastRefreshMonitor.onError(() => {
      setStats(fastRefreshMonitor.getStats())
      setRecentErrors(fastRefreshMonitor.getRecentErrors())
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
      fastRefreshMonitor.stop()
    }
  }, [])

  return {
    stats,
    recentErrors,
    clearErrors: () => {
      fastRefreshMonitor.clearErrors()
      setStats(fastRefreshMonitor.getStats())
      setRecentErrors([])
    }
  }
}

// Importar useState y useEffect
import { useState, useEffect } from 'react'
