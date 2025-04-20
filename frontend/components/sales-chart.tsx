"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Lun",
    ventas: 32000,
    pedidos: 24,
  },
  {
    name: "Mar",
    ventas: 28000,
    pedidos: 21,
  },
  {
    name: "Mié",
    ventas: 35000,
    pedidos: 29,
  },
  {
    name: "Jue",
    ventas: 42000,
    pedidos: 36,
  },
  {
    name: "Vie",
    ventas: 58000,
    pedidos: 45,
  },
  {
    name: "Sáb",
    ventas: 72000,
    pedidos: 60,
  },
  {
    name: "Dom",
    ventas: 48000,
    pedidos: 38,
  },
]

export default function SalesChart() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-[350px] flex items-center justify-center">Cargando gráfico...</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="ventas" name="Ventas ($)" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="pedidos" name="Pedidos" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

