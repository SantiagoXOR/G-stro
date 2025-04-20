import { Button } from "@/components/ui/button"
import { AlertTriangle, ShoppingCart } from "lucide-react"

interface InventoryItem {
  id: number
  name: string
  current: number
  unit: string
  threshold: number
  status: "low" | "critical"
}

const inventoryAlerts: InventoryItem[] = [
  {
    id: 1,
    name: "Carne molida",
    current: 2.5,
    unit: "kg",
    threshold: 5,
    status: "low",
  },
  {
    id: 2,
    name: "Aceite de oliva",
    current: 0.5,
    unit: "l",
    threshold: 2,
    status: "critical",
  },
  {
    id: 3,
    name: "Queso mozzarella",
    current: 1,
    unit: "kg",
    threshold: 3,
    status: "low",
  },
]

export default function InventoryAlerts() {
  return (
    <div className="space-y-3">
      {inventoryAlerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay alertas de inventario.</p>
      ) : (
        <>
          {inventoryAlerts.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${item.status === "critical" ? "text-red-500" : "text-amber-500"}`}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Quedan: {item.current} {item.unit} (Min: {item.threshold} {item.unit})
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8">
                <ShoppingCart className="mr-1 h-3 w-3" />
                Pedir
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full">
            Ver todos los insumos
          </Button>
        </>
      )}
    </div>
  )
}

