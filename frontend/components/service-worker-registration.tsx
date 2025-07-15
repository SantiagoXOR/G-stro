'use client'

import { useEffect } from 'react'

/**
 * Componente para registrar el Service Worker
 * Solo se ejecuta en el cliente y en producción
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Solo registrar en producción y si el navegador soporta Service Workers
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registrado exitosamente:', registration)

      // Manejar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.log('Nueva versión del Service Worker disponible')
              
              // Opcional: Mostrar notificación al usuario
              if (window.confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        }
      })

      // Manejar cuando el Service Worker toma control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker ha tomado control')
      })

    } catch (error) {
      console.error('Error al registrar Service Worker:', error)
    }
  }

  // Este componente no renderiza nada
  return null
}

export default ServiceWorkerRegistration
