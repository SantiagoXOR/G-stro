'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useRealtimeStatus } from '@/components/realtime-error-boundary'

export default function TestRealtimePage() {
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Pruebas de Supabase Realtime</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return <TestRealtimeContent />
}

function TestRealtimeContent() {
  const [clientStatus, setClientStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [testResults, setTestResults] = useState<string[]>([])
  const { isAvailable: isRealtimeAvailable, lastError } = useRealtimeStatus()

  useEffect(() => {
    testSupabaseClient()
  }, [])

  const testSupabaseClient = async () => {
    try {
      setTestResults(prev => [...prev, '🔄 Iniciando prueba del cliente de Supabase...'])
      
      const client = await getSupabaseClient()
      
      if (!client) {
        setClientStatus('error')
        setTestResults(prev => [...prev, '❌ No se pudo obtener el cliente de Supabase'])
        return
      }

      setTestResults(prev => [...prev, '✅ Cliente de Supabase obtenido exitosamente'])

      // Verificar capacidades
      const caps: string[] = []
      
      if (typeof client.channel === 'function') {
        caps.push('channel')
        setTestResults(prev => [...prev, '✅ Función channel disponible'])
      } else {
        setTestResults(prev => [...prev, '❌ Función channel NO disponible'])
      }

      if (client.realtime) {
        caps.push('realtime')
        setTestResults(prev => [...prev, '✅ Objeto realtime disponible'])
      } else {
        setTestResults(prev => [...prev, '❌ Objeto realtime NO disponible'])
      }

      if (typeof client.from === 'function') {
        caps.push('database')
        setTestResults(prev => [...prev, '✅ Función from (database) disponible'])
      } else {
        setTestResults(prev => [...prev, '❌ Función from (database) NO disponible'])
      }

      setCapabilities(caps)
      setClientStatus('ready')
      setTestResults(prev => [...prev, `📊 Capacidades detectadas: ${caps.join(', ')}`])

    } catch (error) {
      setClientStatus('error')
      setTestResults(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`])
    }
  }

  const testChannelCreation = async () => {
    try {
      setTestResults(prev => [...prev, '🔄 Probando creación de canal...'])
      
      const client = await getSupabaseClient()
      if (!client || typeof client.channel !== 'function') {
        setTestResults(prev => [...prev, '❌ No se puede crear canal - cliente no disponible'])
        return
      }

      const testChannel = client.channel('test-channel-' + Date.now())
      
      if (testChannel) {
        setTestResults(prev => [...prev, '✅ Canal de prueba creado exitosamente'])
        
        // Probar suscripción
        testChannel.subscribe((status: string) => {
          setTestResults(prev => [...prev, `📡 Estado de suscripción: ${status}`])
        })

        // Limpiar después de 3 segundos
        setTimeout(() => {
          testChannel.unsubscribe()
          setTestResults(prev => [...prev, '✅ Canal de prueba limpiado'])
        }, 3000)
      } else {
        setTestResults(prev => [...prev, '❌ No se pudo crear el canal de prueba'])
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error al crear canal: ${error instanceof Error ? error.message : 'Error desconocido'}`])
    }
  }

  const testNotificationService = async () => {
    try {
      setTestResults(prev => [...prev, '🔄 Probando servicio de notificaciones...'])

      // Importar dinámicamente el servicio para evitar problemas de SSR
      const { pushNotificationService } = await import('@/lib/services/push-notification-service')

      // Probar configuración de notificaciones en tiempo real
      pushNotificationService.setupRealtimeNotifications()
      setTestResults(prev => [...prev, '✅ Servicio de notificaciones configurado'])

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error en servicio de notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pruebas de Supabase Realtime</h1>
        <p className="text-muted-foreground">
          Esta página permite probar las funcionalidades de tiempo real de Supabase
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estado del Cliente
              <Badge variant={clientStatus === 'ready' ? 'default' : clientStatus === 'error' ? 'destructive' : 'secondary'}>
                {clientStatus === 'ready' ? 'Listo' : clientStatus === 'error' ? 'Error' : 'Cargando'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Estado actual del cliente de Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tiempo Real:</span>
                <Badge variant={isRealtimeAvailable ? 'default' : 'destructive'}>
                  {isRealtimeAvailable ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>
              
              {lastError && (
                <div className="text-sm text-destructive">
                  Último error: {lastError}
                </div>
              )}
              
              <div className="text-sm">
                <span className="font-medium">Capacidades:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {capabilities.map(cap => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles de Prueba */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Prueba</CardTitle>
            <CardDescription>
              Ejecuta diferentes pruebas para verificar el funcionamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testSupabaseClient} className="w-full">
              Probar Cliente de Supabase
            </Button>
            
            <Button 
              onClick={testChannelCreation} 
              className="w-full"
              disabled={clientStatus !== 'ready'}
            >
              Probar Creación de Canal
            </Button>
            
            <Button 
              onClick={testNotificationService} 
              className="w-full"
              disabled={clientStatus !== 'ready'}
            >
              Probar Servicio de Notificaciones
            </Button>
            
            <Button onClick={clearResults} variant="outline" className="w-full">
              Limpiar Resultados
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resultados de las Pruebas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resultados de las Pruebas</CardTitle>
          <CardDescription>
            Log en tiempo real de las pruebas ejecutadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay resultados aún. Ejecuta una prueba para ver los resultados.
              </p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
