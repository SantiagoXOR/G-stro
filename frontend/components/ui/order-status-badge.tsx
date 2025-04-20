"use client"

import { Order } from "@/lib/services/orders"

interface OrderStatusBadgeProps {
  status: Order["status"]
  className?: string
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "preparing":
        return "En preparación"
      case "ready":
        return "Listo para entregar"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}>
      {getStatusText()}
    </span>
  )
}
