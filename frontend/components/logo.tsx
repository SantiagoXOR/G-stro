"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  useCompleteVersion?: boolean
  customWidth?: number
  customHeight?: number
}

export default function Logo({ className, size = "md", showText = false, useCompleteVersion = false, customWidth, customHeight }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Si se solicita la versión completa, usamos logo-complete.svg o logo-complete-dark.svg
  // Si no, usamos los iconos separados como antes
  // En modo oscuro, usamos el logo con color crema melocotón (#FAECD8)
  // En modo claro, usamos el logo con color verde oscuro (#112D1C)
  const logoSrc = useCompleteVersion
    ? isDark
      ? "/logo-complete.svg"      // Crema melocotón en modo oscuro
      : "/logo-complete-dark.svg" // Verde oscuro en modo claro
    : isDark
      ? "/logo-icon.svg"          // Crema melocotón en modo oscuro
      : "/logo-icon-dark.svg"     // Verde oscuro en modo claro

  const sizes = {
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
  }

  // Para la versión completa, ajustamos el ancho para mantener la proporción
  const { width: defaultWidth, height: defaultHeight } = sizes[size]
  const completeWidth = useCompleteVersion ? defaultWidth * 3.8 : defaultWidth

  // Usar valores personalizados si están disponibles, de lo contrario usar los predeterminados
  const finalWidth = customWidth || (useCompleteVersion ? completeWidth : defaultWidth)
  const finalHeight = customHeight || defaultHeight

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={logoSrc}
        alt="Gëstro Logo"
        width={finalWidth}
        height={finalHeight}
        className="object-contain"
      />
      {!useCompleteVersion && showText && (
        <span className={cn(
          "font-bold tracking-tight",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl",
        )}>
          Gëstro
        </span>
      )}
    </div>
  )
}
