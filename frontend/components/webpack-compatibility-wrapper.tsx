'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'

interface WebpackCompatibilityState {
  hasWebpackError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface WebpackCompatibilityProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper específico para manejar errores de webpack y compatibilidad con React 19
 * Diseñado para resolver el error "Cannot read properties of undefined (reading 'call')"
 */
export class WebpackCompatibilityWrapper extends Component<WebpackCompatibilityProps, WebpackCompatibilityState> {
  constructor(props: WebpackCompatibilityProps) {
    super(props)
    this.state = { hasWebpackError: false }
  }

  static getDerivedStateFromError(error: Error): WebpackCompatibilityState {
    // Detectar errores específicos de webpack
    const isWebpackError = 
      error.message?.includes('call') ||
      error.message?.includes('webpack') ||
      error.message?.includes('module') ||
      error.message?.includes('undefined') ||
      error.stack?.includes('webpack') ||
      error.stack?.includes('react-server-dom-webpack')

    return { 
      hasWebpackError: isWebpackError, 
      error: isWebpackError ? error : undefined 
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log específico para errores de webpack
    if (this.state.hasWebpackError) {
      console.error('🔧 Error de webpack detectado:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })

      // En desarrollo, mostrar información detallada
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Información detallada del error de webpack:')
        console.error('Error completo:', error)
        console.error('Stack del componente:', errorInfo.componentStack)
        console.error('Props del componente:', errorInfo)
        console.groupEnd()
      }

      // Intentar recuperación automática
      this.attemptRecovery()
    }
  }

  attemptRecovery = () => {
    // Intentar recuperación después de un breve delay
    setTimeout(() => {
      if (this.state.hasWebpackError) {
        console.log('🔄 Intentando recuperación automática...')
        this.setState({ hasWebpackError: false, error: undefined })
      }
    }, 1000)
  }

  render() {
    if (this.state.hasWebpackError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback específico para errores de webpack
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          margin: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <h2 style={{ 
            color: '#92400e', 
            marginBottom: '12px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Error de Compatibilidad de Webpack
          </h2>
          <p style={{ 
            color: '#78350f', 
            marginBottom: '16px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Se detectó un problema de compatibilidad con el sistema de módulos.
            <br />
            Esto puede deberse a incompatibilidades entre React 19 y Next.js 15.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => this.setState({ hasWebpackError: false, error: undefined })}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Reintentar
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔃 Recargar Página
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '16px', 
              textAlign: 'left',
              backgroundColor: '#fef2f2',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '8px'
              }}>
                🔍 Detalles técnicos (desarrollo)
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto',
                color: '#7f1d1d',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook para detectar y manejar errores específicos de webpack
 */
export function useWebpackErrorDetection() {
  React.useEffect(() => {
    const handleWebpackError = (event: ErrorEvent) => {
      const isWebpackError = 
        event.message?.includes('call') ||
        event.message?.includes('webpack') ||
        event.message?.includes('module') ||
        event.filename?.includes('webpack')

      if (isWebpackError) {
        console.warn('🔧 Error de webpack detectado:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString()
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      const isWebpackError = 
        reason.includes('call') ||
        reason.includes('webpack') ||
        reason.includes('module')

      if (isWebpackError) {
        console.warn('🔧 Promise rechazada relacionada con webpack:', reason)
      }
    }

    window.addEventListener('error', handleWebpackError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleWebpackError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}

/**
 * Componente de compatibilidad para módulos de webpack
 */
export function WebpackModuleWrapper({ children }: { children: ReactNode }) {
  const [isModuleReady, setIsModuleReady] = React.useState(false)
  const [hasModuleError, setHasModuleError] = React.useState(false)

  React.useEffect(() => {
    // Verificar que los módulos de webpack estén disponibles
    try {
      if (typeof window !== 'undefined' && window.__webpack_require__) {
        setIsModuleReady(true)
      } else {
        // Esperar un poco para que webpack se inicialice
        const timeout = setTimeout(() => {
          if (typeof window !== 'undefined' && window.__webpack_require__) {
            setIsModuleReady(true)
          } else {
            setHasModuleError(true)
          }
        }, 100)

        return () => clearTimeout(timeout)
      }
    } catch (error) {
      console.warn('Error al verificar módulos de webpack:', error)
      setHasModuleError(true)
    }
  }, [])

  // Si hay error de módulos, mostrar fallback
  if (hasModuleError) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  // Si los módulos no están listos, mostrar versión simplificada
  if (!isModuleReady) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

export default WebpackCompatibilityWrapper
