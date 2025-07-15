'use client'

import React, { ReactNode, useEffect, useState } from 'react'

interface ClientLayoutProps {
  children: ReactNode
}

/**
 * Wrapper ultra-simplificado para el layout del cliente
 * Versión mínima sin manipulación de DOM para resolver errores de runtime
 */
export function ClientLayoutWrapper({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizado directo sin fallback complejo
  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      suppressHydrationWarning
    >
      <main className="flex-1 pb-20">
        {mounted ? children : <SimpleLoader />}
      </main>
    </div>
  )
}

/**
 * Loader simple sin animaciones complejas
 */
function SimpleLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Cargando...</p>
      </div>
    </div>
  )
}

export default ClientLayoutWrapper
