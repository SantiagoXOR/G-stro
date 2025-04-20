import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Si hay un error, redirigir a la página de login con el mensaje de error
  if (error) {
    console.error(`Error de autenticación: ${error} - ${errorDescription}`)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Si hay un código, intercambiarlo por una sesión
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set(name, value, options)
            },
            remove(name: string, options: any) {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            },
          },
        }
      )

      // Intercambiar el código por una sesión
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error('Error al intercambiar código por sesión:', sessionError)
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(sessionError.message)}`, request.url)
        )
      }
    } catch (err) {
      console.error('Error inesperado en el callback de autenticación:', err)
      return NextResponse.redirect(
        new URL('/auth/login?error=Error+inesperado+durante+la+autenticaci%C3%B3n', request.url)
      )
    }
  }

  // Redirigir a la página principal después de la autenticación exitosa
  return NextResponse.redirect(new URL('/', request.url))
}
