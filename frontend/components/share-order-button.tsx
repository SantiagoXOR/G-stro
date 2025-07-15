"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Order } from "@/lib/services/orders"

interface ShareOrderButtonProps {
  order: Order
  items?: { name: string; quantity: number }[]
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ShareOrderButton({
  order,
  items = [],
  variant = "outline",
  size = "default",
  className = "",
}: ShareOrderButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  // Generar URL para compartir
  const getShareUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    return `${baseUrl}/orders/shared/${order.id}`
  }

  // Generar texto para compartir
  const getShareText = () => {
    const itemsList = items.length > 0
      ? items.map(item => `${item.quantity}x ${item.name}`).join(", ")
      : "varios productos"
    
    return `¡Acabo de pedir ${itemsList} en Slainte Bar! 🍻 Pedido #${order.id.substring(0, 8)}`
  }

  // Copiar enlace al portapapeles
  const copyToClipboard = () => {
    const url = getShareUrl()
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true)
      toast.success("Enlace copiado al portapapeles")
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  // Compartir en redes sociales
  const shareOnSocial = (platform: "facebook" | "twitter" | "whatsapp") => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    
    let shareUrl = ""
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`
        break
    }
    
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  // Compartir usando la API Web Share si está disponible
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: "Mi pedido en Slainte Bar",
        text: getShareText(),
        url: getShareUrl(),
      })
      .catch(error => console.error("Error al compartir:", error))
    } else {
      // Si la API no está disponible, mostrar el menú desplegable
      document.getElementById("share-dropdown-trigger")?.click()
    }
  }

  return (
    <>
      {/* Botón principal - usa Web Share API si está disponible */}
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={shareNative}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Compartir
      </Button>

      {/* Menú desplegable como fallback */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="share-dropdown-trigger"
            variant={variant}
            size={size}
            className={`hidden ${className}`}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Compartir pedido</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => shareOnSocial("whatsapp")}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => shareOnSocial("facebook")}>
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => shareOnSocial("twitter")}>
            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyToClipboard}>
            {isCopied ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isCopied ? "¡Copiado!" : "Copiar enlace"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
