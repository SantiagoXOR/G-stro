'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  fallbackSrc?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * Componente de imagen segura que maneja errores de carga
 * y proporciona fallbacks automáticos
 */
export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  fallbackSrc,
  placeholder,
  blurDataURL,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Determinar la URL de la imagen a usar
  const getImageSrc = () => {
    if (hasError) {
      return fallbackSrc || getDefaultFallback()
    }
    
    if (!src || src.trim() === '') {
      return fallbackSrc || getDefaultFallback()
    }

    // Validar que la URL sea segura
    if (!isValidImageUrl(src)) {
      console.warn(`URL de imagen no válida: ${src}`)
      return fallbackSrc || getDefaultFallback()
    }

    return src
  }

  // Obtener imagen de fallback por defecto
  const getDefaultFallback = () => {
    if (fill) {
      return `https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=${encodeURIComponent(alt || 'Imagen')}`
    }
    const w = width || 300
    const h = height || 200
    return `https://via.placeholder.com/${w}x${h}/f3f4f6/9ca3af?text=${encodeURIComponent(alt || 'Imagen')}`
  }

  // Validar URL de imagen
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      
      // Lista de hostnames permitidos
      const allowedHostnames = [
        'images.unsplash.com',
        'via.placeholder.com',
        'lh3.googleusercontent.com',
        'example.com', // Para datos de ejemplo
        'localhost',
        '127.0.0.1',
      ]

      // Verificar si es un hostname de Supabase
      const isSupabaseUrl = urlObj.hostname.endsWith('.supabase.co') && 
                           urlObj.pathname.startsWith('/storage/v1/object/public/')

      // Verificar si es un hostname de Vercel Storage
      const isVercelStorage = urlObj.hostname.endsWith('.public.blob.vercel-storage.com')

      // Verificar si es un hostname permitido
      const isAllowedHostname = allowedHostnames.includes(urlObj.hostname)

      return isSupabaseUrl || isVercelStorage || isAllowedHostname
    } catch {
      return false
    }
  }

  const handleError = () => {
    console.warn(`Error al cargar imagen: ${src}`)
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const imageSrc = getImageSrc()

  // Props comunes para el componente Image
  const imageProps = {
    src: imageSrc,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      className
    ),
    onError: handleError,
    onLoad: handleLoad,
    priority,
    sizes,
    placeholder,
    blurDataURL,
  }

  return (
    <div className="relative">
      {fill ? (
        <Image
          {...imageProps}
          fill
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 300}
          height={height || 200}
        />
      )}
      
      {/* Indicador de carga */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-muted',
          fill ? 'w-full h-full' : '',
          !fill && width && height ? `w-[${width}px] h-[${height}px]` : 'w-[300px] h-[200px]'
        )}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Indicador de error (solo en desarrollo) */}
      {hasError && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Error
        </div>
      )}
    </div>
  )
}

/**
 * Hook para validar URLs de imágenes
 */
export function useImageValidation() {
  const validateImageUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false
    
    try {
      const urlObj = new URL(url)
      
      const allowedHostnames = [
        'images.unsplash.com',
        'via.placeholder.com',
        'lh3.googleusercontent.com',
        'example.com',
        'localhost',
        '127.0.0.1',
      ]

      const isSupabaseUrl = urlObj.hostname.endsWith('.supabase.co') && 
                           urlObj.pathname.startsWith('/storage/v1/object/public/')
      const isVercelStorage = urlObj.hostname.endsWith('.public.blob.vercel-storage.com')
      const isAllowedHostname = allowedHostnames.includes(urlObj.hostname)

      return isSupabaseUrl || isVercelStorage || isAllowedHostname
    } catch {
      return false
    }
  }

  const getValidImageUrl = (url: string | null | undefined, fallback?: string): string => {
    if (validateImageUrl(url)) {
      return url!
    }
    
    if (fallback && validateImageUrl(fallback)) {
      return fallback
    }

    return 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Imagen+no+disponible'
  }

  return { validateImageUrl, getValidImageUrl }
}

/**
 * Utilidad para sanitizar URLs de imágenes
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null
  
  try {
    const urlObj = new URL(url)
    
    // Lista de hostnames permitidos
    const allowedHostnames = [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'example.com',
      'localhost',
      '127.0.0.1',
    ]

    const isSupabaseUrl = urlObj.hostname.endsWith('.supabase.co') && 
                         urlObj.pathname.startsWith('/storage/v1/object/public/')
    const isVercelStorage = urlObj.hostname.endsWith('.public.blob.vercel-storage.com')
    const isAllowedHostname = allowedHostnames.includes(urlObj.hostname)

    if (isSupabaseUrl || isVercelStorage || isAllowedHostname) {
      return url
    }

    console.warn(`URL de imagen no permitida: ${url}`)
    return null
  } catch {
    console.warn(`URL de imagen inválida: ${url}`)
    return null
  }
}

export default SafeImage
