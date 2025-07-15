'use client'

import { useEffect, useState } from 'react'
import { PWAManager } from './pwa-manager'
import ErrorBoundary from './error-boundary'

interface PWAWrapperProps {
  children: React.ReactNode
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Asegurar que estamos en el cliente
    setIsClient(true)
    
    // Esperar un poco para que otros componentes se inicialicen
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // No renderizar nada hasta que estemos listos
  if (!isClient || !isReady) {
    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      <PWAManager>
        {children}
      </PWAManager>
    </ErrorBoundary>
  )
}
