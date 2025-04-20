"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Logo from "./logo"
import { Button } from "./ui/button"
import { ChevronLeft, Menu } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  showBackButton?: boolean
  title?: string
  className?: string
}

export default function Header({
  showBackButton = false,
  title,
  className
}: HeaderProps) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className={cn(
      "sticky top-0 z-20 bg-background pt-4 pb-2 px-4 flex items-center",
      className
    )}>
      {showBackButton && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      )}

      {isHomePage ? (
        <div className="flex items-center gap-2">
          <Logo size="md" useCompleteVersion={true} />
        </div>
      ) : (
        <div className="flex items-center">
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          {!title && <Logo size="sm" useCompleteVersion={true} />}
        </div>
      )}
    </header>
  )
}
