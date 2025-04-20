import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "@/components/client-layout"
import { AuthProvider } from "@/components/auth-provider"
import { SupabaseDebug } from "@/components/supabase-debug"
import { ConnectionStatus } from "@/components/connection-status"
import { OfflineModeToggle } from "@/components/offline-mode-toggle"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gëstro - App de Gestión de Restaurante",
  description: "Gestiona tu restaurante y ofrece pedidos por QR a tus clientes",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
            <ConnectionStatus />
            <OfflineModeToggle />
            {process.env.NODE_ENV !== 'production' && <SupabaseDebug />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}