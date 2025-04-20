"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot, X } from "lucide-react"

export default function SimpleAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón flotante para abrir el asistente */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 rounded-full h-14 w-14 p-0 shadow-lg z-50 bg-orange-500 text-white"
        >
          <Bot className="h-8 w-8" />
        </Button>
      )}

      {/* Ventana del asistente */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[90%] max-w-md shadow-lg z-50 bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Asistente Simple</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p>Este es un asistente simplificado para probar la funcionalidad básica.</p>
        </div>
      )}
    </>
  )
}
