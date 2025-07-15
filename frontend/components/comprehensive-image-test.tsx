'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ImageTestResult {
  id: string
  status: 'loading' | 'success' | 'error'
  loadTime?: number
  errorMessage?: string
}

export function ComprehensiveImageTest() {
  const { user } = useUser()
  const [imageResults, setImageResults] = useState<{[key: string]: ImageTestResult}>({})
  const [testStartTime, setTestStartTime] = useState<{[key: string]: number}>({})

  // URLs de prueba exhaustivas
  const testImages = [
    {
      id: 'clerk-user',
      name: 'Imagen de Usuario de Clerk',
      url: user?.imageUrl || '',
      description: 'Imagen de perfil del usuario actual desde Clerk',
      category: 'Autenticación'
    },
    {
      id: 'google-test',
      name: 'Imagen de Google',
      url: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      description: 'Imagen de prueba desde Google User Content',
      category: 'OAuth'
    },
    {
      id: 'unsplash-test',
      name: 'Imagen de Unsplash',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Imagen de prueba desde Unsplash',
      category: 'Contenido'
    },
    {
      id: 'placeholder-test-1',
      name: 'Placeholder Básico',
      url: 'https://via.placeholder.com/150x150',
      description: 'Imagen placeholder básica',
      category: 'Placeholder'
    },
    {
      id: 'placeholder-test-2',
      name: 'Placeholder Personalizado',
      url: 'https://via.placeholder.com/150x150/112D1C/FAECD8?text=Gestro',
      description: 'Imagen placeholder con colores de Gëstro',
      category: 'Placeholder'
    },
    {
      id: 'placeholder-test-3',
      name: 'Placeholder Alternativo',
      url: 'https://placehold.co/150x150/112D1C/FAECD8?text=Test',
      description: 'Servicio alternativo de placeholder',
      category: 'Placeholder'
    },
    {
      id: 'picsum-test',
      name: 'Imagen de Picsum',
      url: 'https://picsum.photos/150/150?random=1',
      description: 'Imagen aleatoria desde Picsum',
      category: 'Contenido'
    }
  ]

  const handleImageLoad = (imageId: string) => {
    const loadTime = testStartTime[imageId] ? Date.now() - testStartTime[imageId] : 0
    setImageResults(prev => ({ 
      ...prev, 
      [imageId]: { 
        id: imageId, 
        status: 'success', 
        loadTime 
      } 
    }))
  }

  const handleImageError = (imageId: string, error?: any) => {
    const loadTime = testStartTime[imageId] ? Date.now() - testStartTime[imageId] : 0
    setImageResults(prev => ({ 
      ...prev, 
      [imageId]: { 
        id: imageId, 
        status: 'error', 
        loadTime,
        errorMessage: error?.message || 'Error al cargar imagen'
      } 
    }))
  }

  const handleImageStart = (imageId: string) => {
    setTestStartTime(prev => ({ ...prev, [imageId]: Date.now() }))
    setImageResults(prev => ({ 
      ...prev, 
      [imageId]: { 
        id: imageId, 
        status: 'loading' 
      } 
    }))
  }

  const resetTests = () => {
    setImageResults({})
    setTestStartTime({})
  }

  const getStatusIcon = (result?: ImageTestResult) => {
    if (!result) return <AlertCircle className="h-5 w-5 text-gray-400" />
    
    switch (result.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />
    }
  }

  const getStatusText = (result?: ImageTestResult) => {
    if (!result) return 'No iniciado'
    
    switch (result.status) {
      case 'success':
        return `Cargada en ${result.loadTime}ms`
      case 'error':
        return `Error: ${result.errorMessage}`
      default:
        return 'Cargando...'
    }
  }

  const getCategoryStats = (category: string) => {
    const categoryImages = testImages.filter(img => img.category === category)
    const categoryResults = categoryImages.map(img => imageResults[img.id]).filter(Boolean)
    const successCount = categoryResults.filter(r => r.status === 'success').length
    const errorCount = categoryResults.filter(r => r.status === 'error').length
    
    return { total: categoryImages.length, success: successCount, error: errorCount }
  }

  // Agrupar imágenes por categoría
  const imagesByCategory = testImages.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = []
    acc[img.category].push(img)
    return acc
  }, {} as {[key: string]: typeof testImages})

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🧪 Prueba Exhaustiva de Imágenes
              </CardTitle>
              <CardDescription>
                Validación completa de carga de imágenes desde todos los dominios configurados
              </CardDescription>
            </div>
            <Button onClick={resetTests} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar Pruebas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.entries(imagesByCategory).map(([category, images]) => {
            const stats = getCategoryStats(category)
            return (
              <div key={category} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="text-sm text-gray-600">
                    {stats.success}/{stats.total} exitosas
                    {stats.error > 0 && `, ${stats.error} errores`}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          {image.url ? (
                            <Image
                              src={image.url}
                              alt={image.name}
                              fill
                              className="object-cover"
                              onLoadStart={() => handleImageStart(image.id)}
                              onLoad={() => handleImageLoad(image.id)}
                              onError={(e) => handleImageError(image.id, e)}
                              sizes="96px"
                              unoptimized={image.category === 'Placeholder'} // Desactivar optimización para placeholders
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{image.name}</h4>
                            {getStatusIcon(imageResults[image.id])}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{image.description}</p>
                          <div className="text-xs space-y-1">
                            <p><strong>Estado:</strong> {getStatusText(imageResults[image.id])}</p>
                            {image.url && (
                              <p><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded text-xs break-all">{image.url}</code></p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <strong>Usuario Autenticado:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-xs">
                <li>• Nombre: {user?.fullName || 'No disponible'}</li>
                <li>• Email: {user?.primaryEmailAddress?.emailAddress || 'No disponible'}</li>
                <li>• ID: {user?.id || 'No disponible'}</li>
                <li>• Imagen URL: {user?.imageUrl ? '✅ Disponible' : '❌ No disponible'}</li>
              </ul>
            </div>
            
            <div>
              <strong>Dominios Configurados:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-xs">
                <li>• img.clerk.com, images.clerk.dev (Clerk)</li>
                <li>• lh3.googleusercontent.com (Google)</li>
                <li>• avatars.githubusercontent.com (GitHub)</li>
                <li>• www.gravatar.com (Gravatar)</li>
                <li>• images.unsplash.com, picsum.photos (Contenido)</li>
                <li>• via.placeholder.com, placehold.co (Placeholders)</li>
              </ul>
            </div>

            <div>
              <strong>Configuración de Optimización:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-xs">
                <li>• Formatos: WebP, AVIF</li>
                <li>• Cache TTL: 60 segundos</li>
                <li>• Lazy Loading: Habilitado</li>
                <li>• Responsive: Automático</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
