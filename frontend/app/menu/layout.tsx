"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getTableByNumber } from "@/lib/services/tables"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get("table")
  const [tableInfo, setTableInfo] = useState<{ number: number; location?: string } | null>(null)
  const [showTableBanner, setShowTableBanner] = useState(true)

  // Cargar información de la mesa si se proporciona un número de mesa
  useEffect(() => {
    const fetchTableInfo = async () => {
      if (!tableNumber) return

      try {
        const tableNumberInt = parseInt(tableNumber)
        if (isNaN(tableNumberInt)) return

        const table = await getTableByNumber(tableNumberInt)
        if (table) {
          setTableInfo({
            number: table.table_number,
            location: table.location || undefined
          })
        }
      } catch (error) {
        console.error("Error al cargar información de la mesa:", error)
      }
    }

    fetchTableInfo()
  }, [tableNumber])

  return (
    <>
      {tableInfo && showTableBanner && (
        <div className="sticky top-0 z-50 w-full">
          <Alert className="rounded-none border-t-0 border-x-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <div>
                  <AlertTitle className="text-sm">
                    Mesa {tableInfo.number}
                    {tableInfo.location && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {tableInfo.location}
                      </Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Tu pedido será enviado a esta mesa
                  </AlertDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowTableBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}
      {children}
    </>
  )
}
