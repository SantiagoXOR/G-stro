'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function ImageTest() {
  const { user } = useUser()
  const [imageLoadStatus, setImageLoadStatus] = useState<{[key: string]: 'loading' | 'success' | 'error'}>({})

  const handleImageLoad = (imageId: string) => {
    setImageLoadStatus(prev => ({ ...prev, [imageId]: 'success' }))
  }

  const handleImageError = (imageId: string) => {
    setImageLoadStatus(prev => ({ ...prev, [imageId]: 'error' }))
  }

  // URLs de prueba para diferentes dominios
  const testImages = [
    {
      id: 'clerk-user',
      name: 'Imagen de Usuario de Clerk',
      url: user?.imageUrl || '',
      description: 'Imagen de perfil del usuario actual desde Clerk'
    },
    {
      id: 'unsplash-test',
      name: 'Imagen de Unsplash',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Imagen de prueba desde Unsplash'
    },
    {
      id: 'placeholder-test',
      name: 'Imagen Placeholder',
      url: 'https://via.placeholder.com/150x150/112D1C/FAECD8?text=Test',
      description: 'Imagen de prueba desde placeholder'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Cargada correctamente'
      case 'error':
        return 'Error al cargar'
      default:
        return 'Cargando...'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🖼️ Prueba de Configuración de Imágenes
          </CardTitle>
          <CardDescription>
            Verificación de que las imágenes de diferentes dominios se cargan correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        className="object-cover"
                        onLoad={() => handleImageLoad(image.id)}
                        onError={() => handleImageError(image.id)}
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{image.name}</h3>
                      {getStatusIcon(imageLoadStatus[image.id] || 'loading')}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{image.description}</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Estado:</strong> {getStatusText(imageLoadStatus[image.id] || 'loading')}</p>
                      {image.url && (
                        <p><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{image.url}</code></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Dominios configurados en Next.js:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-xs">
                <li>• img.clerk.com (Imágenes de Clerk)</li>
                <li>• images.clerk.dev (Imágenes de Clerk Dev)</li>
                <li>• lh3.googleusercontent.com (Google Profile Images)</li>
                <li>• avatars.githubusercontent.com (GitHub Profile Images)</li>
                <li>• www.gravatar.com (Gravatar Images)</li>
                <li>• images.unsplash.com (Unsplash Images)</li>
                <li>• via.placeholder.com (Placeholder Images)</li>
              </ul>
            </div>
            
            <div>
              <strong>Usuario actual:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-xs">
                <li>• ID: {user?.id || 'No disponible'}</li>
                <li>• Email: {user?.primaryEmailAddress?.emailAddress || 'No disponible'}</li>
                <li>• Imagen URL: {user?.imageUrl ? 'Disponible' : 'No disponible'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
