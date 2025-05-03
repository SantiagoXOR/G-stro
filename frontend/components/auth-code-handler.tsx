"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    const handleCode = async () => {
      if (!code) return

      try {
        console.log('Intercambiando código por sesión en el cliente...')

        // Listar todas las claves en localStorage para depuración
        console.log('Contenido de localStorage:')
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          console.log(`- ${key}: ${key && localStorage.getItem(key) ? 'tiene valor' : 'vacío'}`)
        }

        // Verificar si hay un code_verifier en localStorage
        // Buscar con diferentes formatos de clave posibles
        let codeVerifier = localStorage.getItem('supabase.auth.code_verifier')

        if (!codeVerifier) {
          // Intentar con otras posibles claves
          const possibleKeys = [
            'supabase.auth.code_verifier',
            'sb-olxxrwdxsubpiujsxzxa-auth-token',
            'sb:olxxrwdxsubpiujsxzxa:auth:code_verifier',
            'supabase-auth-code-verifier'
          ]

          for (const key of possibleKeys) {
            const value = localStorage.getItem(key)
            if (value) {
              console.log(`Encontrado code_verifier en clave alternativa: ${key}`)
              codeVerifier = value
              break
            }
          }
        }

        console.log('Code verifier encontrado:', codeVerifier ? 'Sí' : 'No')

        if (!codeVerifier) {
          console.error('No se encontró code_verifier en localStorage')
          console.log('Intentando autenticación alternativa a través del servidor...')

          // Mostrar mensaje más detallado para ayudar a depurar
          console.error('Este error puede ocurrir si:')
          console.error('1. Las cookies o el almacenamiento local fueron borrados durante el proceso de autenticación')
          console.error('2. La URL de redirección no está configurada correctamente en Supabase o Google')
          console.error('3. Hay un problema con la configuración de CORS en Supabase')

          try {
            // Intentar autenticación alternativa a través del servidor
            const response = await fetch(`/api/auth/callback-handler?code=${code}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();

            if (data.error) {
              console.error('Error en autenticación alternativa:', data.error);
              toast.error('Error de autenticación: ' + data.error);
              router.push('/auth/login');
              return;
            }

            if (data.success) {
              console.log('Autenticación alternativa exitosa');
              toast.success('Inicio de sesión exitoso');

              // Limpiar la URL (eliminar el parámetro code)
              window.history.replaceState({}, document.title, window.location.pathname);

              // Recargar la página para obtener la sesión actualizada
              window.location.href = '/';
              return;
            }
          } catch (err) {
            console.error('Error en autenticación alternativa:', err);
          }

          toast.error('Error de autenticación: falta información necesaria');
          router.push('/auth/login');
          return;
        }

        // Intercambiar el código por una sesión
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Error al intercambiar código por sesión:', error)
          toast.error('Error al iniciar sesión. Por favor, intente nuevamente.')
          router.push('/auth/login')
          return
        }

        if (data?.session) {
          console.log('Sesión creada exitosamente')
          toast.success('Inicio de sesión exitoso')

          // Limpiar la URL (eliminar el parámetro code)
          window.history.replaceState({}, document.title, window.location.pathname)

          // Redirigir al usuario a la página principal
          router.push('/')
        }
      } catch (err) {
        console.error('Error inesperado al procesar el código de autenticación:', err)
        toast.error('Error inesperado al iniciar sesión')
        router.push('/auth/login')
      }
    }

    handleCode()
  }, [code, router])

  // No renderizar nada, este componente solo maneja la lógica
  return null
}
