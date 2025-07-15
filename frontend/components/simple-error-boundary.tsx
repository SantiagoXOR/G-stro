'use client'

import React, { Component, ReactNode } from 'react'

interface SimpleErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface SimpleErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Error Boundary simplificado y altamente compatible
 * Diseñado específicamente para resolver problemas de hidratación
 * Compatible con React 19 y Next.js 15
 */
export class SimpleErrorBoundary extends Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SimpleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log simple del error
    console.error('SimpleErrorBoundary capturó un error:', error.message)
    
    // En desarrollo, mostrar más información
    if (process.env.NODE_ENV === 'development') {
      console.error('Error completo:', error)
      console.error('Información del componente:', errorInfo.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto muy simple
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>
            Error en la aplicación
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '15px' }}>
            Se produjo un error inesperado. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook para detectar errores de hidratación
 */
export function useHydrationErrorDetection() {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Hydration') || event.message.includes('hydration')) {
        console.warn('Error de hidratación detectado:', event.message)
        // Opcional: reportar a servicio de monitoreo
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
}

/**
 * Componente wrapper que maneja errores de hidratación
 */
export function HydrationSafeWrapper({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Durante la hidratación, renderizar una versión simplificada
  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return <>{children}</>
}

export default SimpleErrorBoundary
