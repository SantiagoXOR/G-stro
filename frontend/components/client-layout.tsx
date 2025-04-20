"use client"

import React from "react"
import { usePathname } from "next/navigation"
import BottomNavigation from "@/components/bottom-navigation"
import AIAssistant from "@/components/ai-assistant"
import { OrderNotifications } from "@/components/order-notification"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return isAdminRoute ? (
    // Layout para rutas de administración - sin restricciones de ancho
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  ) : (
    // Layout para rutas de cliente - con ancho máximo y navegación inferior
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavigation />
      <AIAssistant />
      <OrderNotifications />
    </div>
  )
}
