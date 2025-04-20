import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TableStatus = "free" | "occupied" | "reserved" | "paying"

interface Table {
  id: number
  number: number
  status: TableStatus
  time?: string
  guests?: number
}

const tables: Table[] = [
  { id: 1, number: 1, status: "occupied", time: "45m", guests: 4 },
  { id: 2, number: 2, status: "free" },
  { id: 3, number: 3, status: "occupied", time: "12m", guests: 2 },
  { id: 4, number: 4, status: "paying", time: "1h 20m", guests: 6 },
  { id: 5, number: 5, status: "reserved", time: "18:30", guests: 2 },
  { id: 6, number: 6, status: "free" },
  { id: 7, number: 7, status: "occupied", time: "30m", guests: 3 },
  { id: 8, number: 8, status: "free" },
  { id: 9, number: 9, status: "reserved", time: "20:00", guests: 4 },
]

export default function TableGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {tables.map((table) => (
        <div
          key={table.id}
          className={cn(
            "flex flex-col items-center justify-center rounded-md p-2 text-center transition-colors",
            table.status === "free" && "bg-green-100 text-green-700",
            table.status === "occupied" && "bg-blue-100 text-blue-700",
            table.status === "reserved" && "bg-amber-100 text-amber-700",
            table.status === "paying" && "bg-purple-100 text-purple-700",
          )}
        >
          <span className="text-xs font-medium">Mesa {table.number}</span>
          {table.status !== "free" && (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 text-xs",
                  table.status === "occupied" && "border-blue-200",
                  table.status === "reserved" && "border-amber-200",
                  table.status === "paying" && "border-purple-200",
                )}
              >
                {table.status === "occupied" && `${table.time}`}
                {table.status === "reserved" && `${table.time}`}
                {table.status === "paying" && "Pagando"}
              </Badge>
              {table.guests && <span className="mt-1 text-[10px]">{table.guests} personas</span>}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

