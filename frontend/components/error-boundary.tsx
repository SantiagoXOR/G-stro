'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Error Boundary compatible con React 19 y Next.js 15
 * Maneja errores de renderizado de forma elegante
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Registrar el error para debugging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)

    this.setState({
      hasError: true,
      error,
      errorInfo
    })

    // Llamar al callback de error si está definido
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // En desarrollo, mostrar más detalles del error
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary - Detalles del Error')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Si hay un componente fallback personalizado, usarlo
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">¡Oops! Algo salió mal</CardTitle>
              <CardDescription>
                Se produjo un error inesperado en la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium text-destructive mb-2">Error de desarrollo:</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.resetError} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar de nuevo
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Recargar página
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Ir al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrapper funcional para el Error Boundary
 * Proporciona una interfaz más moderna y compatible
 */
function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Hook para usar con React Error Boundary en componentes funcionales
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error manejado por useErrorHandler:', error, errorInfo)

    // En desarrollo, mostrar más detalles
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler - Detalles del Error')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      if (errorInfo) {
        console.error('Component Stack:', errorInfo.componentStack)
      }
      console.groupEnd()
    }
  }
}

// Componente de error simple para casos específicos
export function SimpleErrorFallback({
  error,
  resetError
}: {
  error: Error
  resetError: () => void
}) {
  return (
    <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h3 className="font-medium text-destructive">Error en el componente</h3>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <p className="text-sm text-muted-foreground mb-3 font-mono">
          {error.message}
        </p>
      )}

      <Button size="sm" onClick={resetError} variant="outline">
        <RefreshCw className="h-3 w-3 mr-1" />
        Reintentar
      </Button>
    </div>
  )
}

/**
 * Error Boundary con manejo de hidratación mejorado
 * Compatible con React 19 y Next.js 15
 */
export function SafeErrorBoundary({
  children,
  fallback
}: {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}) {
  // En el servidor, simplemente renderizar los children
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  // En el cliente, usar el ErrorBoundary completo
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
