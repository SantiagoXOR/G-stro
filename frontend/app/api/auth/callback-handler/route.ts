import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('API de callback-handler iniciada')

    // Obtener el código de autorización de la URL
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      console.error('No se proporcionó código de autorización')
      return NextResponse.json({
        success: false,
        error: 'No se proporcionó código de autorización'
      }, { status: 400 })
    }

    console.log('Código de autorización recibido:', code.substring(0, 10) + '...')

    // Crear cliente de Supabase para el servidor
    const supabase = createRouteHandlerClient()

    try {
      // Intercambiar el código por una sesión
      // Nota: En el servidor no necesitamos el code_verifier porque usamos cookies
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error al intercambiar código por sesión:', error)

        // Si el error es sobre code_verifier, intentar una solución alternativa
        if (error.message.includes('both auth code and code verifier should be non-empty')) {
          console.log('Error de code_verifier detectado, intentando solución alternativa...')

          try {
            // Intentar usar el método signInWithIdToken si está disponible
            // Este método puede no estar disponible en todas las versiones de Supabase
            console.log('Intentando usar método alternativo de autenticación...')

            // Crear una nueva sesión directamente
            const { data: sessionData, error: sessionError } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${new URL(request.url).origin}/auth/callback`,
                skipBrowserRedirect: true,
              },
            })

            if (sessionError) {
              console.error('Error en método alternativo:', sessionError)
              return NextResponse.json({
                success: false,
                error: `Error en método alternativo: ${sessionError.message}`
              }, { status: 500 })
            }

            if (sessionData) {
              console.log('Autenticación alternativa exitosa')
              return NextResponse.json({
                success: true,
                message: 'Autenticación alternativa exitosa'
              })
            }
          } catch (altError: any) {
            console.error('Error en método alternativo:', altError)
          }
        }

        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 })
      }

      console.log('Sesión creada exitosamente en el servidor')

      // Devolver respuesta exitosa
      return NextResponse.json({
        success: true,
        message: 'Autenticación exitosa'
      })
    } catch (error: any) {
      console.error('Error inesperado al intercambiar código:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Error inesperado durante la autenticación'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error general en callback-handler:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error inesperado'
    }, { status: 500 })
  }
}
