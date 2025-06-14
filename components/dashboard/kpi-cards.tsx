"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react"

const kpis = [
  {
    title: "OEE",
    value: "78.5%",
    change: "+2.1%",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Taxa de Refugo",
    value: "2.3%",
    change: "-0.5%",
    trend: "down",
    icon: TrendingDown,
    color: "text-red-600",
  },
  {
    title: "Paradas Não Planejadas",
    value: "4",
    change: "+1",
    trend: "up",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    title: "Produção Diária",
    value: "1,247",
    change: "+156",
    trend: "up",
    icon: Package,
    color: "text-blue-600",
  },
]

export function KPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpi.change} em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
