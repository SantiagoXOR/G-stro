// Desactivamos temporalmente el middleware para solucionar problemas de autenticación
// Cuando la autenticación funcione correctamente, podemos volver a activarlo

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Permitir todas las solicitudes sin verificar autenticación
  return NextResponse.next()
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
