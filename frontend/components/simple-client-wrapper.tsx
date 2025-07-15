'use client'

import React, { Component, ReactNode, ErrorInfo, useEffect, useState } from 'react'

interface ErrorState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface SimpleClientWrapperProps {
  children: ReactNode
}

/**
 * Wrapper simplificado y robusto para React 19 + Next.js 15
 * Diseñado específicamente para resolver errores de webpack y módulos
 */
export class SimpleClientWrapper extends Component<SimpleClientWrapperProps, ErrorState> {
  private retryCount = 0
  private maxRetries = 2

  constructor(props: SimpleClientWrapperProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    // Detectar errores específicos de webpack y módulos
    const isWebpackError = 
      error.message?.includes('call') ||
      error.message?.includes('webpack') ||
      error.message?.includes('module') ||
      error.message?.includes('undefined') ||
      error.stack?.includes('webpack') ||
      error.stack?.includes('react-server-dom-webpack')

    console.error('🔧 Error detectado en SimpleClientWrapper:', {
      message: error.message,
      isWebpackError,
      stack: error.stack?.substring(0, 200) + '...'
    })

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log simplificado para debugging
    console.group('🔍 Error en SimpleClientWrapper:')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack?.substring(0, 300) + '...')
    console.groupEnd()

    // Recuperación automática para errores de webpack
    const isRecoverableError = 
      error.message?.includes('call') ||
      error.message?.includes('webpack') ||
      error.message?.includes('module')

    if (isRecoverableError && this.retryCount < this.maxRetries) {
      console.log(`🔄 Intentando recuperación automática (${this.retryCount + 1}/${this.maxRetries})`)
      this.retryCount++
      
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
      }, 500)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={() => {
            this.retryCount = 0
            this.setState({ hasError: false, error: undefined, errorInfo: undefined })
          }}
          onReload={() => window.location.reload()}
        />
      )
    }

    return <HydrationSafeWrapper>{this.props.children}</HydrationSafeWrapper>
  }
}

/**
 * Wrapper para manejo seguro de hidratación
 */
function HydrationSafeWrapper({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marcar como hidratado después del montaje
    setIsHydrated(true)

    // Manejo global de errores de webpack
    const handleGlobalError = (event: ErrorEvent) => {
      const isWebpackError = 
        event.message?.includes('call') ||
        event.message?.includes('webpack') ||
        event.filename?.includes('webpack')

      if (isWebpackError) {
        console.warn('🔧 Error global de webpack suprimido:', event.message)
        event.preventDefault()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      const isWebpackError = 
        reason.includes('call') ||
        reason.includes('webpack') ||
        reason.includes('module')

      if (isWebpackError) {
        console.warn('🔧 Promise rechazada de webpack suprimida:', reason)
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Durante la hidratación, renderizar con suppressHydrationWarning
  if (!isHydrated) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Componente de fallback simplificado para errores
 */
function ErrorFallback({ 
  error, 
  onRetry, 
  onReload 
}: {
  error?: Error
  onRetry: () => void
  onReload: () => void
}) {
  const isWebpackError = 
    error?.message?.includes('call') || 
    error?.stack?.includes('webpack') ||
    error?.stack?.includes('react-server-dom-webpack')
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>
          {isWebpackError ? '⚙️' : '❌'}
        </div>
        
        <h1 style={{ 
          color: '#374151', 
          marginBottom: '1rem',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {isWebpackError ? 'Error de Sistema de Módulos' : 'Error de Aplicación'}
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {isWebpackError 
            ? 'Se detectó un problema con el sistema de módulos. Esto puede deberse a incompatibilidades entre React 19 y Next.js 15.'
            : 'Se produjo un error inesperado en la aplicación.'
          }
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔄 Reintentar
          </button>
          
          <button
            onClick={onReload}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔃 Recargar Página
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details style={{ 
            marginTop: '1.5rem', 
            textAlign: 'left',
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🔍 Detalles técnicos
            </summary>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto',
              color: '#6b7280',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Error:</strong> {error.message}
              {'\n\n'}
              <strong>Stack:</strong> {error.stack?.substring(0, 500) + '...'}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default SimpleClientWrapper
