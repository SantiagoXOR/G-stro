import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando flujo de autenticación con Google desde la ruta dedicada')
    
    // Crear cliente de Supabase para el servidor
    const supabase = createRouteHandlerClient()
    
    // Obtener la URL de origen para la redirección
    const origin = request.headers.get('origin') || request.nextUrl.origin
    const callbackUrl = `${origin}/auth/callback`
    
    console.log('URL de callback:', callbackUrl)
    
    // Iniciar el flujo de autenticación con Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      console.error('Error al iniciar autenticación con Google:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // Si todo va bien, redirigir a la URL proporcionada por Supabase
    if (data?.url) {
      console.log('Redirigiendo a URL de autenticación de Google:', data.url)
      return NextResponse.redirect(data.url)
    }
    
    // Si no hay URL, algo salió mal
    console.error('No se recibió URL de redirección de Supabase')
    return NextResponse.redirect(
      new URL('/auth/login?error=No+se+recibió+URL+de+redirección', request.url)
    )
  } catch (err) {
    console.error('Error inesperado en la ruta de autenticación con Google:', err)
    return NextResponse.redirect(
      new URL('/auth/login?error=Error+inesperado+durante+la+autenticación', request.url)
    )
  }
}
