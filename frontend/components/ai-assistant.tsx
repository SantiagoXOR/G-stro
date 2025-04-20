"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, X, ShoppingCart, Calendar, Menu, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function AIAssistant() {
  // Iniciar con el asistente cerrado
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente virtual de Slainte Bar. Puedo ayudarte a buscar productos, hacer pedidos o reservar una mesa. ¿En qué puedo ayudarte hoy?"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Actualizar sugerencias basadas en la conversación
  useEffect(() => {
    if (messages.length <= 1) {
      setSuggestions([
        "¿Qué platos recomiendan?",
        "¿Tienen mesas disponibles para mañana?",
        "Quiero hacer un pedido"
      ])
      return
    }

    const lastMessage = messages[messages.length - 1]

    if (lastMessage.role === "assistant") {
      const content = lastMessage.content.toLowerCase()

      if (content.includes("menú") || content.includes("platos") || content.includes("productos")) {
        setSuggestions([
          "Quiero ordenar una milanesa",
          "¿Tienen postres?",
          "Mostrar bebidas disponibles"
        ])
      } else if (content.includes("mesa") || content.includes("reserva")) {
        setSuggestions([
          "Reservar mesa para 4 personas",
          "¿Cuál es la política de cancelación?",
          "Prefiero ordenar para llevar"
        ])
      } else if (content.includes("pedido") || content.includes("orden")) {
        setSuggestions([
          "Ver estado de mi pedido",
          "Añadir algo más a mi pedido",
          "¿Cuánto tiempo tarda la entrega?"
        ])
      } else {
        setSuggestions([
          "Ver el menú",
          "Hacer una reserva",
          "Realizar un pedido"
        ])
      }
    }
  }, [messages])

  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    // Añadir mensaje del usuario
    const userMessage = { role: "user" as const, content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSuggestions([])
    setIsLoading(true)

    try {
      // Preparar el contexto para el modelo
      const context = {
        userId: user?.id,
        messages: [...messages, userMessage]
      }

      // Enviar la solicitud al endpoint de MCP
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        })
      })

      if (!response.ok) {
        throw new Error("Error al comunicarse con el asistente")
      }

      const data = await response.json()

      // Añadir respuesta del asistente
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Botón flotante para abrir el asistente */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 rounded-full h-14 w-14 p-0 shadow-lg z-50 bg-orange-500 text-peach-cream-50 hover:bg-orange-600 flex items-center justify-center"
        >
          <Bot className="h-8 w-8" />
          <span className="sr-only">Abrir asistente</span>
        </Button>
      )}

      {/* Ventana del asistente */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-[90%] max-w-md shadow-lg md:bottom-6 z-50 max-h-[70vh] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-orange-500">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-peach-cream-50" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">Asistente Slainte</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 pb-0">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2",
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 mt-1",
                    message.role === "assistant" ? "bg-orange-500" : "bg-primary"
                  )}>
                    <AvatarFallback>
                      {message.role === "assistant" ? <Bot className="h-4 w-4 text-peach-cream-50" /> : <User className="h-4 w-4 text-peach-cream-50" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      message.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 mt-1 bg-orange-500">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-peach-cream-50" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce delay-75"></div>
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sugerencias */}
              {!isLoading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted px-3 py-1.5 text-sm"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Acciones rápidas */}
          <div className="px-4 py-2 border-t border-b">
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2" onClick={() => handleSendMessage("Ver el menú")}>
                <Menu className="h-4 w-4" />
                <span className="text-xs">Menú</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2" onClick={() => handleSendMessage("Hacer un pedido")}>
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Ordenar</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2" onClick={() => handleSendMessage("Reservar una mesa")}>
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Reservar</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2" onClick={() => handleSendMessage("Buscar un producto")}>
                <Search className="h-4 w-4" />
                <span className="text-xs">Buscar</span>
              </Button>
            </div>
          </div>

          <CardFooter className="pt-4">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-peach-cream-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
