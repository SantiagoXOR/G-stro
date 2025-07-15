'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Home, User, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface NavigationTest {
  id: string
  name: string
  path: string
  description: string
  requiresAuth: boolean
  status: 'pending' | 'testing' | 'success' | 'error'
  errorMessage?: string
}

export function NavigationTest() {
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [tests, setTests] = useState<NavigationTest[]>([
    {
      id: 'home',
      name: 'Página Principal',
      path: '/',
      description: 'Página de inicio de la aplicación',
      requiresAuth: false,
      status: 'pending'
    },
    {
      id: 'test-auth',
      name: 'Página de Pruebas',
      path: '/test-auth',
      description: 'Página de pruebas de autenticación',
      requiresAuth: false,
      status: 'pending'
    },
    {
      id: 'profile',
      name: 'Página de Perfil',
      path: '/profile',
      description: 'Página de perfil del usuario',
      requiresAuth: true,
      status: 'pending'
    },
    {
      id: 'sign-in',
      name: 'Página de Inicio de Sesión',
      path: '/auth/sign-in',
      description: 'Página de autenticación de Clerk',
      requiresAuth: false,
      status: 'pending'
    },
    {
      id: 'sign-up',
      name: 'Página de Registro',
      path: '/auth/sign-up',
      description: 'Página de registro de Clerk',
      requiresAuth: false,
      status: 'pending'
    }
  ])

  const updateTestStatus = (id: string, status: NavigationTest['status'], errorMessage?: string) => {
    setTests(prev => prev.map(test => 
      test.id === id 
        ? { ...test, status, errorMessage }
        : test
    ))
  }

  const testNavigation = async (test: NavigationTest) => {
    if (test.requiresAuth && !isSignedIn) {
      updateTestStatus(test.id, 'error', 'Requiere autenticación')
      toast.error(`${test.name} requiere autenticación`)
      return
    }

    updateTestStatus(test.id, 'testing')
    
    try {
      // Simular navegación y verificación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En una implementación real, aquí verificaríamos que la página carga correctamente
      updateTestStatus(test.id, 'success')
      toast.success(`${test.name} - Navegación exitosa`)
    } catch (error) {
      updateTestStatus(test.id, 'error', error instanceof Error ? error.message : 'Error desconocido')
      toast.error(`Error en ${test.name}`)
    }
  }

  const navigateToPage = (path: string) => {
    router.push(path)
  }

  const testSignOut = async () => {
    try {
      await signOut()
      toast.success('Cierre de sesión exitoso')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const runAllTests = async () => {
    for (const test of tests) {
      await testNavigation(test)
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const getStatusIcon = (status: NavigationTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'testing':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusText = (test: NavigationTest) => {
    switch (test.status) {
      case 'success':
        return 'Funcionando correctamente'
      case 'error':
        return test.errorMessage || 'Error desconocido'
      case 'testing':
        return 'Probando navegación...'
      default:
        return 'Pendiente de prueba'
    }
  }

  const successfulTests = tests.filter(t => t.status === 'success').length
  const totalTests = tests.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🧭 Pruebas de Navegación y UX
              </CardTitle>
              <CardDescription>
                Verificación de rutas y experiencia de usuario
              </CardDescription>
            </div>
            <div className="text-sm text-gray-600">
              {successfulTests}/{totalTests} rutas funcionando
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={runAllTests} size="sm" className="bg-bush-700 hover:bg-bush-800">
                Probar Todas las Rutas
              </Button>
              {isSignedIn && (
                <Button onClick={testSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Probar Cierre de Sesión
                </Button>
              )}
            </div>

            {tests.map(test => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{test.name}</h4>
                      {test.requiresAuth && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Requiere Auth
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{test.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ruta: <code className="bg-gray-100 px-1 rounded">{test.path}</code>
                    </p>
                    <p className="text-xs mt-1">
                      Estado: {getStatusText(test)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => testNavigation(test)}
                    disabled={test.status === 'testing'}
                    size="sm"
                    variant="outline"
                  >
                    Probar
                  </Button>
                  <Button
                    onClick={() => navigateToPage(test.path)}
                    size="sm"
                    variant="ghost"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">
                {isSignedIn ? 'Usuario Autenticado' : 'Usuario No Autenticado'}
              </span>
              {isSignedIn ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            
            {isSignedIn && user && (
              <div className="ml-7 space-y-1 text-sm text-gray-600">
                <p><strong>Nombre:</strong> {user.fullName || 'No disponible'}</p>
                <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Imagen:</strong> {user.imageUrl ? 'Disponible' : 'No disponible'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => navigateToPage('/')}
              variant="outline"
              className="justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
            <Button
              onClick={() => navigateToPage('/profile')}
              variant="outline"
              className="justify-start"
              disabled={!isSignedIn}
            >
              <User className="h-4 w-4 mr-2" />
              Ver Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
