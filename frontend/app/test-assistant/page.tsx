"use client"

import AIAssistant from "@/components/ai-assistant"
import SimpleAssistant from "@/components/simple-assistant"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TestAssistantPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba del Asistente de IA</h1>
      <p className="mb-4">
        Esta página es para probar el asistente de IA. Deberías ver un botón flotante con un icono de robot en la parte inferior derecha de la pantalla.
      </p>
      <p className="mb-4">
        Al hacer clic en el botón, se abrirá el chat del asistente. Puedes probar el asistente con las siguientes consultas:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>¿Qué productos tienen disponibles?</li>
        <li>Muéstrame el menú</li>
        <li>¿Hay mesas disponibles para mañana?</li>
        <li>¿Cuáles son mis pedidos anteriores?</li>
      </ul>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>

      {/* Incluimos ambos asistentes para comparar */}
      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-2">Asistente Simple</h2>
        <p className="mb-4">Este asistente es una versión simplificada para pruebas.</p>
        <SimpleAssistant />
      </div>

      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-2">Asistente Completo</h2>
        <p className="mb-4">Este es el asistente completo con todas las funcionalidades.</p>
        <AIAssistant />
      </div>
    </div>
  )
}
