'use client'

import React, { ReactNode, useEffect, useState } from 'react'

interface LayoutWrapperProps {
  children: ReactNode
}

/**
 * Wrapper de layout que maneja errores de hidratación y compatibilidad con React 19
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Manejar errores globales
    const handleError = (event: ErrorEvent) => {
      console.error('Error global capturado:', event.error)
      
      // Si es un error relacionado con React/hidratación, manejarlo
      if (
        event.error?.message?.includes('call') ||
        event.error?.message?.includes('undefined') ||
        event.error?.message?.includes('hydration')
      ) {
        console.warn('Error de React/hidratación detectado, activando modo seguro')
        setHasError(true)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rechazada:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Durante la hidratación inicial, mostrar una versión simplificada
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  // Si hay error, mostrar fallback
  if (hasError) {
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
          Se detectó un error de compatibilidad. Recargando la página...
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

  return <>{children}</>
}

/**
 * Hook para detectar y manejar errores de React 19
 */
export function useReact19ErrorHandler() {
  useEffect(() => {
    // Interceptar errores específicos de React 19
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      
      // Filtrar errores conocidos de React 19 que no son críticos
      if (
        message.includes('Warning: ReactDOM.render is no longer supported') ||
        message.includes('Warning: React.createFactory() is deprecated') ||
        message.includes('Warning: componentWillReceiveProps has been renamed')
      ) {
        // Silenciar estos warnings específicos
        return
      }
      
      // Llamar al console.error original para otros errores
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])
}

export default LayoutWrapper
