"use client"

import { useTheme } from "next-themes"

export default function ColorPalette() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Paleta de Colores Gëstro</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">Colores Principales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard
              name="Primary"
              color="bg-primary"
              textColor="text-primary-foreground"
              value={isDark ? "#112D1C" : "#112D1C"}
            />
            <ColorCard
              name="Primary Foreground"
              color="bg-primary-foreground"
              textColor="text-primary"
              value="#fdf7ef"
            />
            <ColorCard
              name="Accent"
              color="bg-accent"
              textColor="text-accent-foreground"
              value="#FAECD8"
            />
            <ColorCard
              name="Accent Foreground"
              color="bg-accent-foreground"
              textColor="text-accent"
              value="#112D1C"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Paleta Bush (Verde)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ColorCard name="Bush 50" color="bg-bush-50" textColor="text-bush-950" value="#f3faf5" />
            <ColorCard name="Bush 100" color="bg-bush-100" textColor="text-bush-950" value="#e3f5e9" />
            <ColorCard name="Bush 200" color="bg-bush-200" textColor="text-bush-950" value="#c8ead3" />
            <ColorCard name="Bush 300" color="bg-bush-300" textColor="text-bush-950" value="#9dd8b1" />
            <ColorCard name="Bush 400" color="bg-bush-400" textColor="text-bush-950" value="#6abe87" />
            <ColorCard name="Bush 500" color="bg-bush-500" textColor="text-peach-cream-50" value="#46a165" />
            <ColorCard name="Bush 600" color="bg-bush-600" textColor="text-peach-cream-50" value="#358450" />
            <ColorCard name="Bush 700" color="bg-bush-700" textColor="text-peach-cream-50" value="#2c6942" />
            <ColorCard name="Bush 800" color="bg-bush-800" textColor="text-peach-cream-50" value="#275437" />
            <ColorCard name="Bush 900" color="bg-bush-900" textColor="text-peach-cream-50" value="#22452f" />
            <ColorCard name="Bush 950" color="bg-bush-950" textColor="text-peach-cream-50" value="#112d1c" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Paleta Peach Cream (Melocotón)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ColorCard name="Peach Cream 50" color="bg-peach-cream-50" textColor="text-peach-cream-950" value="#fdf7ef" />
            <ColorCard name="Peach Cream 100" color="bg-peach-cream-100" textColor="text-peach-cream-950" value="#faecd8" />
            <ColorCard name="Peach Cream 200" color="bg-peach-cream-200" textColor="text-peach-cream-950" value="#f4d7b4" />
            <ColorCard name="Peach Cream 300" color="bg-peach-cream-300" textColor="text-peach-cream-950" value="#edbc84" />
            <ColorCard name="Peach Cream 400" color="bg-peach-cream-400" textColor="text-peach-cream-950" value="#e59652" />
            <ColorCard name="Peach Cream 500" color="bg-peach-cream-500" textColor="text-peach-cream-50" value="#df7b30" />
            <ColorCard name="Peach Cream 600" color="bg-peach-cream-600" textColor="text-peach-cream-50" value="#d16325" />
            <ColorCard name="Peach Cream 700" color="bg-peach-cream-700" textColor="text-peach-cream-50" value="#ad4c21" />
            <ColorCard name="Peach Cream 800" color="bg-peach-cream-800" textColor="text-peach-cream-50" value="#8b3e21" />
            <ColorCard name="Peach Cream 900" color="bg-peach-cream-900" textColor="text-peach-cream-50" value="#70341e" />
            <ColorCard name="Peach Cream 950" color="bg-peach-cream-950" textColor="text-peach-cream-50" value="#3c190e" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ColorCardProps {
  name: string
  color: string
  textColor: string
  value: string
}

function ColorCard({ name, color, textColor, value }: ColorCardProps) {
  return (
    <div className="flex flex-col">
      <div className={`${color} ${textColor} h-20 rounded-t-lg flex items-center justify-center p-2 text-center`}>
        {name}
      </div>
      <div className="bg-background border border-border rounded-b-lg p-2 text-xs text-center">
        {value}
      </div>
    </div>
  )
}
