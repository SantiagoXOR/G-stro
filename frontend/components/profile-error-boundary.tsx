'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ProfileErrorBoundaryProps {
  children: React.ReactNode
}

interface ProfileErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ProfileErrorBoundary extends React.Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  constructor(props: ProfileErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ProfileErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProfileErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return <ProfileErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface ProfileErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

function ProfileErrorFallback({ error, onRetry }: ProfileErrorFallbackProps) {

  const getErrorMessage = (error: Error | null) => {
    if (!error) return 'Error desconocido'
    
    if (error.message.includes('supabase is not defined')) {
      return 'Error de configuración de base de datos'
    }
    
    if (error.message.includes('perfil del usuario')) {
      return 'No se pudo cargar el perfil del usuario'
    }
    
    return error.message
  }

  const getErrorSolution = (error: Error | null) => {
    if (!error) return 'Intenta recargar la página'
    
    if (error.message.includes('supabase is not defined')) {
      return 'Verifica la configuración de Supabase en las variables de entorno'
    }
    
    if (error.message.includes('perfil del usuario')) {
      return 'Es posible que tu perfil no esté creado. Intenta cerrar sesión e iniciar sesión nuevamente.'
    }
    
    return 'Intenta recargar la página o contacta al soporte técnico'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bush-50 to-peach-cream-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Error en el Perfil
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Solución sugerida:</strong><br />
              {getErrorSolution(error)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={onRetry} 
              className="w-full bg-bush-700 hover:bg-bush-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="bg-red-50 p-3 rounded-lg">
              <summary className="text-sm font-medium text-red-800 cursor-pointer">
                Detalles del Error (Desarrollo)
              </summary>
              <pre className="mt-2 text-xs text-red-700 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
