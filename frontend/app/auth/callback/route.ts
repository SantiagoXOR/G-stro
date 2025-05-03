import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '../../../shared/types/database.types'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  console.log('Callback de autenticación iniciado')
  const requestUrl = new URL(request.url)

  // Obtener parámetros de la URL
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const state = requestUrl.searchParams.get('state')

  // Registrar todos los parámetros de la URL para depuración
  console.log('URL completa:', request.url)
  console.log('Parámetros de la URL:')
  requestUrl.searchParams.forEach((value, key) => {
    console.log(`${key}: ${value}`)
  })

  console.log('Parámetros principales:', {
    code: code ? 'presente' : 'ausente',
    error,
    errorDescription,
    state: state ? 'presente' : 'ausente'
  })

  // Si hay un error, redirigir a la página de login con el mensaje de error
  if (error) {
    console.error(`Error de autenticación: ${error} - ${errorDescription}`)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Si hay un código, intentar intercambiarlo por una sesión en el servidor
  if (code) {
    try {
      console.log('Procesando código de autenticación en el servidor...')
      console.log('Código de autorización:', code.substring(0, 10) + '...')

      // Verificar si hay otros parámetros importantes
      if (state) {
        console.log('Parámetro state encontrado:', state)
      }

      // Crear cliente de Supabase para el servidor
      const supabase = createRouteHandlerClient()

      try {
        // Intentar intercambiar el código por una sesión directamente en el servidor
        console.log('Intentando intercambiar código por sesión en el servidor...')
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error('Error al intercambiar código por sesión en el servidor:', sessionError)

          // Si el error es sobre code_verifier, intentar una solución alternativa
          if (sessionError.message.includes('both auth code and code verifier should be non-empty')) {
            console.log('Error de code_verifier detectado, intentando solución alternativa...')

            try {
              // Intentar usar la API de callback-handler primero
              console.log('Intentando usar la API de callback-handler...')
              const apiResponse = await fetch(`${request.nextUrl.origin}/api/auth/callback-handler?code=${code}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })

              const apiData = await apiResponse.json()

              if (apiData.success) {
                console.log('Autenticación exitosa a través de la API')
                return NextResponse.redirect(new URL('/', request.url))
              }

              console.log('La API no pudo autenticar, redirigiendo a la página de recuperación')
            } catch (apiError) {
              console.error('Error al intentar usar la API de callback-handler:', apiError)
            }

            // Si la API falla, redirigir a la página especial que intentará recuperar la sesión
            return NextResponse.redirect(
              new URL(`/auth/recovery?code=${code}${state ? `&state=${state}` : ''}`, request.url)
            )
          }

          // Para otros errores, intentar en el cliente
          console.log('Redirigiendo al cliente para intentar autenticación...')
          const redirectUrl = new URL(`/?code=${code}`, request.url)

          // Preservar el parámetro state si existe
          if (state) {
            redirectUrl.searchParams.append('state', state)
          }

          console.log('URL de redirección al cliente:', redirectUrl.toString())
          return NextResponse.redirect(redirectUrl)
        }

        console.log('Intercambio de código exitoso:', data ? 'Sesión creada' : 'Sin datos')

        // Si la autenticación fue exitosa en el servidor, redirigir a la página principal
        console.log('Autenticación exitosa en el servidor, redirigiendo a la página principal')
        return NextResponse.redirect(new URL('/', request.url))
      } catch (serverAuthError) {
        console.error('Error inesperado al autenticar en el servidor:', serverAuthError)

        // Si hay un error en el servidor, intentar en el cliente
        const redirectUrl = new URL(`/?code=${code}`, request.url)
        if (state) {
          redirectUrl.searchParams.append('state', state)
        }
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('Error inesperado en el callback de autenticación:', err)
      return NextResponse.redirect(
        new URL('/auth/login?error=Error+inesperado+durante+la+autenticaci%C3%B3n', request.url)
      )
    }
  } else {
    console.error('No se proporcionó código de autorización')
    return NextResponse.redirect(
      new URL('/auth/login?error=No+se+proporcion%C3%B3+c%C3%B3digo+de+autorizaci%C3%B3n', request.url)
    )
  }
}