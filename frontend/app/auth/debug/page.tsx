"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase-config"
import { signInWithEmail, signUpWithEmail } from "@/lib/auth"

export default function AuthDebugPage() {
  const [localStorageItems, setLocalStorageItems] = useState<{key: string, value: string}[]>([])
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'No configurada'
  })
  const [connectionStatus, setConnectionStatus] = useState<string>("Verificando...")
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [authResult, setAuthResult] = useState<string>('')

  useEffect(() => {
    // Cargar elementos de localStorage
    loadLocalStorageItems()

    // Verificar conexión con Supabase
    checkSupabaseConnection()
  }, [])

  const loadLocalStorageItems = () => {
    if (typeof window === 'undefined') return

    const items: {key: string, value: string}[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        // Ocultar valores sensibles
        const displayValue = key.includes('token') || key.includes('code_verifier')
          ? value.substring(0, 10) + '...'
          : value
        items.push({ key, value: displayValue })
      }
    }
    setLocalStorageItems(items)
  }

  const checkSupabaseConnection = async () => {
    try {
      setConnectionStatus("Verificando...")

      // Usar la tabla health_check para verificar la conexión
      const { data: healthData, error: healthError } = await supabase.from('health_check').select('*').limit(1)

      if (healthError) {
        console.error('Error al conectar con Supabase (health_check):', healthError)

        // Intentar verificar perfiles como segunda opción
        try {
          const { error: profilesError } = await supabase.from('profiles').select('count').limit(1)

          if (profilesError) {
            // Ambas pruebas fallaron
            console.error('Error al verificar perfiles:', profilesError)

            if (profilesError.message.includes('infinite recursion')) {
              setConnectionStatus(`Error: infinite recursion detected in policy for relation "profiles"`)

              // Intentar reparar automáticamente
              try {
                console.log('Intentando reparar automáticamente la recursión infinita...')
                const { data: testData, error: testError } = await supabase.rpc('test_profiles_recursion_simple')

                if (testError) {
                  console.error('Error al probar recursión:', testError)
                } else {
                  console.log('Resultado de prueba de recursión:', testData)
                  if (testData && testData.includes('PASADA')) {
                    // La prueba pasó, no hay recursión
                    setConnectionStatus(`Conexión parcial: Problema de recursión resuelto, pero hay otros errores`)
                  }
                }
              } catch (repairErr) {
                console.error('Error al intentar reparar:', repairErr)
              }
            } else {
              setConnectionStatus(`Error: ${profilesError.message}`)
            }
          } else {
            // Solo falló health_check
            setConnectionStatus(`Conexión parcial: health_check error, profiles OK`)
          }
        } catch (profileErr) {
          console.error('Error al verificar perfiles:', profileErr)
          setConnectionStatus(`Error: ${healthError.message}`)
        }
        return
      }

      // Health check OK, verificar perfiles
      try {
        const { error: profilesError } = await supabase.from('profiles').select('count').limit(1)

        if (profilesError) {
          console.warn('Error al verificar perfiles:', profilesError)

          if (profilesError.message.includes('infinite recursion')) {
            setConnectionStatus(`Conexión parcial: infinite recursion detected in policy for relation "profiles"`)

            // Intentar reparar automáticamente
            try {
              console.log('Intentando reparar automáticamente la recursión infinita...')
              const { data: testData, error: testError } = await supabase.rpc('test_profiles_recursion_simple')

              if (testError) {
                console.error('Error al probar recursión:', testError)
              } else {
                console.log('Resultado de prueba de recursión:', testData)
                if (testData && testData.includes('PASADA')) {
                  // La prueba pasó, no hay recursión
                  setConnectionStatus(`Conexión parcial: Problema de recursión resuelto, pero hay otros errores`)
                }
              }
            } catch (repairErr) {
              console.error('Error al intentar reparar:', repairErr)
            }
          } else {
            setConnectionStatus(`Conexión parcial: ${profilesError.message}`)
          }
        } else {
          // Ambas pruebas exitosas
          setConnectionStatus("Conexión exitosa")
        }
      } catch (profileErr) {
        console.warn('Error al verificar perfiles:', profileErr)
        setConnectionStatus("Conexión parcial (health_check OK, profiles error)")
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setConnectionStatus(`Error inesperado: ${err}`)
    }
  }

  const clearLocalStorage = () => {
    if (typeof window === 'undefined') return

    localStorage.clear()
    loadLocalStorageItems()
  }

  const testAuthFlow = async () => {
    try {
      // Limpiar cualquier sesión anterior
      await supabase.auth.signOut()

      // Limpiar localStorage y sessionStorage de valores relacionados con el flujo
      const projectRef = window.location.hostname.includes('localhost')
        ? 'localhost'
        : window.location.hostname.split('.')[0]

      // Limpiar todas las posibles claves relacionadas con el flujo
      const keysToRemove = [
        'supabase.auth.flow-state',
        `sb-${projectRef}-auth-flow-state`,
        'supabase.auth.code_verifier',
        'supabase-auth-code-verifier-backup',
        'sb-code-verifier',
        `sb-${projectRef}-auth-code-verifier`
      ]

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      // Importar las funciones mejoradas
      const { generateCodeVerifier, saveCodeVerifier, startOAuthFlow } = await import('@/lib/supabase')

      console.log('Iniciando flujo de autenticación con Google...')
      const redirectTo = `${window.location.origin}/auth/callback`

      // Usar nuestra función mejorada para iniciar el flujo
      const { success, data, error } = await startOAuthFlow('google', {
        redirectTo,
        scopes: 'email profile openid',
      })

      if (error) {
        console.error('Error al iniciar flujo de autenticación:', error)
        alert(`Error al iniciar flujo de autenticación: ${error.message}`)
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      alert(`Error inesperado: ${err}`)
    }
  }

  const testServerAuthFlow = async () => {
    try {
      // Limpiar cualquier sesión anterior
      await supabase.auth.signOut()

      // Limpiar localStorage y sessionStorage de valores relacionados con el flujo
      const projectRef = window.location.hostname.includes('localhost')
        ? 'localhost'
        : window.location.hostname.split('.')[0]

      // Limpiar todas las posibles claves relacionadas con el flujo
      const keysToRemove = [
        'supabase.auth.flow-state',
        `sb-${projectRef}-auth-flow-state`,
        'supabase.auth.code_verifier',
        'supabase-auth-code-verifier-backup',
        'sb-code-verifier',
        `sb-${projectRef}-auth-code-verifier`
      ]

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      // Importar las funciones mejoradas
      const { generateCodeVerifier, saveCodeVerifier } = await import('@/lib/supabase')

      // Generar y guardar un nuevo code_verifier
      const newCodeVerifier = generateCodeVerifier()
      saveCodeVerifier(newCodeVerifier)

      console.log('Nuevo code_verifier generado y guardado para flujo del servidor')

      // Redirigir a la ruta del servidor para autenticación
      window.location.href = '/auth/google'
    } catch (err) {
      console.error('Error inesperado:', err)
      alert(`Error inesperado: ${err}`)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticación</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Supabase</CardTitle>
            <CardDescription>Información de configuración de Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">URL:</span> <span className="text-primary">{supabaseConfig.url}</span>
              </div>
              <div>
                <span className="font-semibold">Clave anónima:</span> {supabaseConfig.anonKey}
              </div>
              <div>
                <span className="font-semibold">Estado de conexión:</span>
                <span className={`ml-1 ${connectionStatus.includes('Error') ? 'text-red-500' : connectionStatus.includes('parcial') ? 'text-amber-500' : 'text-green-500'}`}>
                  {connectionStatus}
                </span>
                {connectionStatus.includes('infinite recursion') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={async () => {
                      try {
                        setConnectionStatus("Reparando políticas RLS...")
                        const { data, error } = await supabase.rpc('fix_profiles_rls')
                        if (error) {
                          alert(`Error al reparar políticas RLS: ${error.message}`)
                          setConnectionStatus(`Error al reparar: ${error.message}`)
                        } else {
                          alert(`Políticas RLS reparadas correctamente. Resultado:\n\n${data}`)
                          // Verificar conexión nuevamente
                          checkSupabaseConnection()
                        }
                      } catch (err) {
                        alert(`Error inesperado: ${err}`)
                        setConnectionStatus(`Error inesperado: ${err}`)
                      }
                    }}
                  >
                    Reparar recursión
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={checkSupabaseConnection}>Verificar conexión</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
            <CardDescription>Elementos almacenados en localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            {localStorageItems.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {localStorageItems.map((item, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold">{item.key}:</span> {item.value}
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay elementos en localStorage</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={loadLocalStorageItems} variant="outline">Actualizar</Button>
            <Button onClick={clearLocalStorage} variant="destructive">Limpiar</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Autenticación</CardTitle>
            <CardDescription>Herramientas para probar el flujo de autenticación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Verificar estado de la base de datos</h3>
                <p className="text-sm mb-2">
                  Esto ejecutará la función de reparación de perfiles para verificar y corregir problemas en la tabla profiles.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.rpc('repair_profiles_advanced')
                        if (error) {
                          alert(`Error al verificar perfiles: ${error.message}`)
                        } else {
                          alert(`Resultado de la verificación:\n\n${data}`)
                        }
                      } catch (err) {
                        alert(`Error inesperado: ${err}`)
                      }
                    }}
                    className="mr-2"
                    variant="secondary"
                  >
                    Verificar y reparar perfiles
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.rpc('fix_profiles_rls')
                        if (error) {
                          alert(`Error al reparar políticas RLS: ${error.message}`)
                        } else {
                          alert(`Resultado de la reparación:\n\n${data}`)
                          // Recargar la página para ver los cambios
                          window.location.reload()
                        }
                      } catch (err) {
                        alert(`Error inesperado: ${err}`)
                      }
                    }}
                    variant="destructive"
                    className="mr-2"
                  >
                    Reparar políticas RLS
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.rpc('test_profiles_recursion_simple')
                        if (error) {
                          alert(`Error al probar recursión: ${error.message}`)
                        } else {
                          alert(`Resultado de la prueba de recursión:\n\n${data}`)
                        }
                      } catch (err) {
                        alert(`Error inesperado: ${err}`)
                      }
                    }}
                    variant="outline"
                  >
                    Probar recursión
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Probar flujo de autenticación con Google (Cliente)</h3>
                <p className="text-sm mb-2">
                  Esto iniciará el flujo de autenticación con Google directamente desde el cliente. Serás redirigido a Google para iniciar sesión.
                </p>
                <Button onClick={testAuthFlow} className="mr-2">Iniciar prueba cliente</Button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Probar flujo de autenticación con Google (Servidor)</h3>
                <p className="text-sm mb-2">
                  Esto iniciará el flujo de autenticación con Google a través del servidor. Serás redirigido a Google para iniciar sesión.
                </p>
                <Button onClick={testServerAuthFlow} variant="secondary">Iniciar prueba servidor</Button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Herramientas para code_verifier</h3>
                <p className="text-sm mb-2">
                  Estas herramientas te ayudarán a diagnosticar y solucionar problemas con el code_verifier.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      // Importar las funciones de generación y guardado del code_verifier
                      const { generateCodeVerifier, saveCodeVerifier } = await import('@/lib/supabase')

                      // Generar y guardar un nuevo code_verifier
                      const newCodeVerifier = generateCodeVerifier()
                      saveCodeVerifier(newCodeVerifier)

                      alert('Nuevo code_verifier generado y guardado: ' + newCodeVerifier.substring(0, 10) + '...')
                      loadLocalStorageItems()
                    }}
                    variant="outline"
                    className="mr-2"
                  >
                    Generar code_verifier
                  </Button>

                  <Button
                    onClick={() => {
                      // Verificar si hay un code_verifier en localStorage
                      const codeVerifier = localStorage.getItem('supabase.auth.code_verifier')

                      if (!codeVerifier) {
                        alert('No se encontró code_verifier en localStorage')
                        return
                      }

                      // Copiar al portapapeles
                      navigator.clipboard.writeText(codeVerifier)
                        .then(() => alert('Code verifier copiado al portapapeles'))
                        .catch(err => alert(`Error al copiar: ${err}`))
                    }}
                    variant="secondary"
                    className="mr-2"
                  >
                    Copiar code_verifier
                  </Button>

                  <Button
                    onClick={() => {
                      const codeVerifier = prompt('Ingresa el code_verifier a guardar:')
                      if (!codeVerifier) return

                      // Guardar en múltiples ubicaciones
                      localStorage.setItem('supabase.auth.code_verifier', codeVerifier)
                      localStorage.setItem('supabase-auth-code-verifier-backup', codeVerifier)
                      localStorage.setItem('sb-code-verifier', codeVerifier)
                      sessionStorage.setItem('supabase.auth.code_verifier', codeVerifier)

                      alert('Code verifier guardado en múltiples ubicaciones')
                      loadLocalStorageItems()
                    }}
                    variant="outline"
                  >
                    Establecer code_verifier
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Solucionar error de code_verifier</h3>
                <p className="text-sm mb-2 text-amber-600">
                  Si estás viendo el error "both auth code and code verifier should be non-empty", usa estas herramientas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      // Obtener el código de la URL actual
                      const urlParams = new URLSearchParams(window.location.search)
                      const code = urlParams.get('code')

                      if (!code) {
                        alert('No hay código de autorización en la URL actual')
                        return
                      }

                      // Redirigir a la página de recuperación con el código
                      window.location.href = `/auth/recovery?code=${code}`
                    }}
                    variant="destructive"
                    className="mr-2"
                  >
                    Recuperar sesión actual
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        // Cerrar sesión actual
                        await supabase.auth.signOut()

                        // Limpiar localStorage
                        localStorage.clear()
                        sessionStorage.clear()

                        // Recargar la página
                        alert('Sesión cerrada y almacenamiento limpiado. La página se recargará.')
                        window.location.reload()
                      } catch (err) {
                        alert(`Error: ${err}`)
                      }
                    }}
                    variant="outline"
                  >
                    Reiniciar todo
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Pruebas de Autenticación con Email</h3>
                <p className="text-sm mb-2">
                  Prueba la autenticación con email y contraseña directamente desde el cliente.
                </p>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          setAuthResult('Procesando...');
                          const { data, error } = await signInWithEmail(email, password);
                          if (error) {
                            setAuthResult(`Error: ${error.message}`);
                          } else {
                            setAuthResult(`Éxito: Usuario autenticado. ID: ${data?.user?.id}`);
                            // Recargar los elementos de localStorage
                            loadLocalStorageItems();
                          }
                        } catch (err) {
                          setAuthResult(`Error inesperado: ${err}`);
                        }
                      }}
                    >
                      Iniciar Sesión (Cliente)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          setAuthResult('Procesando...');
                          const { data, error } = await signUpWithEmail(email, password);
                          if (error) {
                            setAuthResult(`Error: ${error.message}`);
                          } else {
                            setAuthResult(`Éxito: Usuario registrado. ID: ${data?.user?.id}`);
                            // Recargar los elementos de localStorage
                            loadLocalStorageItems();
                          }
                        } catch (err) {
                          setAuthResult(`Error inesperado: ${err}`);
                        }
                      }}
                    >
                      Registrarse (Cliente)
                    </Button>
                  </div>
                  {authResult && (
                    <div className={`p-2 text-sm rounded ${authResult.includes('Éxito') ? 'bg-green-100 text-green-800' : authResult.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {authResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
