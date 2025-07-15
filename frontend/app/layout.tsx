import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@/components/clerk-provider"
import { ClerkCompatibilityProvider } from "@/lib/clerk-client"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "@/components/client-layout"
import { Toaster } from "@/components/ui/sonner"
import { Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gëstro - App de Gestión de Restaurante",
  description: "Gestiona tu restaurante y ofrece pedidos por QR a tus clientes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gëstro"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#112D1C'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ClerkCompatibilityProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
              <Toaster />
            </ClerkCompatibilityProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}