'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface RootErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface RootErrorBoundaryProps {
  children: ReactNode
}

/**
 * Error Boundary específico para el layout raíz
 * Diseñado para ser compatible con React 19 y Next.js 15
 * Maneja errores críticos que podrían romper toda la aplicación
 */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: RootErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    // Generar un ID único para el error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Registrar el error de forma detallada
    console.error('🚨 Error crítico en RootErrorBoundary:', error)
    console.error('📍 Información del error:', errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })

    // En desarrollo, mostrar información detallada
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Root Error Boundary - Análisis Detallado')
      console.error('Error:', error)
      console.error('Mensaje:', error.message)
      console.error('Stack:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Error ID:', this.state.errorId)
      console.groupEnd()
    }

    // Reportar error a servicio de monitoreo si está disponible
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Aquí se podría integrar con servicios como Sentry, LogRocket, etc.
      if (typeof window !== 'undefined' && (window as any).reportError) {
        (window as any).reportError({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }
    } catch (reportingError) {
      console.warn('No se pudo reportar el error:', reportingError)
    }
  }

  private resetError = () => {
    this.retryCount++
    
    if (this.retryCount <= this.maxRetries) {
      console.log(`🔄 Intentando recuperación automática (${this.retryCount}/${this.maxRetries})`)
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: undefined
      })
    } else {
      console.warn('⚠️ Máximo número de reintentos alcanzado')
      // Forzar recarga completa de la página
      window.location.reload()
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <html lang="es">
          <head>
            <title>Error - Gëstro</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: '#fafafa'
            }}>
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    ¡Oops! Error crítico
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Se produjo un error inesperado que afectó la aplicación completa.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="p-3 bg-gray-100 rounded-md border">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Error de desarrollo:
                      </p>
                      <p className="text-xs text-gray-600 font-mono break-all">
                        {this.state.error.message}
                      </p>
                      {this.state.errorId && (
                        <p className="text-xs text-gray-500 mt-2">
                          ID: {this.state.errorId}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {this.retryCount < this.maxRetries && (
                      <Button 
                        onClick={this.resetError} 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Intentar de nuevo ({this.maxRetries - this.retryCount} intentos restantes)
                      </Button>
                    )}
                    
                    <Button 
                      onClick={this.handleReload}
                      variant="outline" 
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recargar aplicación
                    </Button>
                    
                    <Button 
                      onClick={this.handleGoHome}
                      variant="ghost" 
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Ir al inicio
                    </Button>
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Si el problema persiste, contacta al soporte técnico.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </body>
        </html>
      )
    }

    return this.props.children
  }
}
