"use client"

import { Home, Menu, ShoppingCart, User, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart-store"

export default function BottomNavigation() {
  const pathname = usePathname()
  const itemsCount = useCartStore((state) => state.getItemsCount())

  const navItems = [
    {
      label: "Inicio",
      href: "/",
      icon: Home,
    },
    {
      label: "Menú",
      href: "/menu",
      icon: Menu,
    },
    {
      label: "Buscar",
      href: "/search",
      icon: Search,
    },
    {
      label: "Carrito",
      href: "/cart",
      icon: ShoppingCart,
    },
    {
      label: "Perfil",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto bg-white dark:bg-card shadow-lg rounded-t-xl border-t">
        <nav className="flex justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 flex-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-6 w-6", isActive && "fill-primary")} />
                  {item.label === "Carrito" && itemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {itemsCount > 9 ? "9+" : itemsCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

