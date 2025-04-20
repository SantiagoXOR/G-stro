"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { checkSupabaseConnectivity, checkCorsIssues, verifySupabaseProject } from "@/lib/supabase-connectivity"

export function SupabaseDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<string>("Verificando...")
  const [testResult, setTestResult] = useState<string>("")
  const [corsStatus, setCorsStatus] = useState<string>("No verificado")
  const [projectStatus, setProjectStatus] = useState<string>("No verificado")
  const [networkDetails, setNetworkDetails] = useState<any>(null)

  useEffect(() => {
    // Obtener la URL de Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado"
    setSupabaseUrl(url)

    // Verificar la conexión
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setConnectionStatus("Verificando...")

      // Verificar conectividad básica
      const connectivityResult = await checkSupabaseConnectivity()
      setNetworkDetails(connectivityResult.details)

      if (!connectivityResult.success) {
        setConnectionStatus(`Error: ${connectivityResult.message}`)
        return
      }

      // Verificar sesión de Supabase
      const startTime = Date.now()
      const { data, error } = await supabase.auth.getSession()
      const endTime = Date.now()
      const responseTime = endTime - startTime

      if (error) {
        setConnectionStatus(`Error de sesión: ${error.message}`)
      } else {
        setConnectionStatus(`Conectado (${responseTime}ms)`)
      }
    } catch (err) {
      setConnectionStatus(`Error: ${err instanceof Error ? err.message : "Desconocido"}`)
    }
  }

  const checkCors = async () => {
    try {
      setCorsStatus("Verificando...")
      const corsResult = await checkCorsIssues()
      setCorsStatus(corsResult.message)
    } catch (err) {
      setCorsStatus(`Error: ${err instanceof Error ? err.message : "Desconocido"}`)
    }
  }

  const checkProject = async () => {
    try {
      setProjectStatus("Verificando...")
      const projectResult = await verifySupabaseProject()
      setProjectStatus(projectResult.message)
      if (projectResult.details) {
        setNetworkDetails(projectResult.details)
      }
    } catch (err) {
      setProjectStatus(`Error: ${err instanceof Error ? err.message : "Desconocido"}`)
    }
  }

  const testSignUp = async () => {
    try {
      setTestResult("Probando registro...")
      const testEmail = `test_${Date.now()}@example.com`
      const testPassword = "Test123456!"

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        if (error.message && error.message.includes('Database error saving new user')) {
          setTestResult(`Error en el servidor de Supabase: Database error saving new user. Este es un problema conocido con el servidor de Supabase. Por favor, usa el modo offline para continuar con el desarrollo.`)
        } else {
          setTestResult(`Error en registro: ${error.message}`)
        }
      } else {
        setTestResult(`Registro exitoso para ${testEmail}`)
      }
    } catch (err) {
      setTestResult(`Error inesperado: ${err instanceof Error ? err.message : "Desconocido"}`)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between">
            <span>Supabase Debug</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>URL:</strong> {supabaseUrl}
          </div>
          <div>
            <strong>Estado:</strong> {connectionStatus}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
              onClick={checkConnection}
            >
              Verificar
            </Button>
          </div>
          <div>
            <strong>CORS:</strong> {corsStatus}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
              onClick={checkCors}
            >
              Verificar CORS
            </Button>
          </div>
          <div>
            <strong>Proyecto:</strong> {projectStatus}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
              onClick={checkProject}
            >
              Verificar Proyecto
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={testSignUp}
            >
              Probar Registro
            </Button>
            <div className="mt-1">{testResult}</div>
          </div>
          {networkDetails && (
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
              <strong>Detalles de red:</strong>
              <pre>{JSON.stringify(networkDetails, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
