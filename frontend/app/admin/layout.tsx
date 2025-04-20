"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { StaffNotifications } from "@/components/admin/staff-notifications"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Verificar si estamos en la página de login
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-end px-6 gap-4 bg-background sticky top-0 z-10">
            <StaffNotifications />
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

