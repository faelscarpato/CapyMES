"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ProductionTimeline } from "@/components/dashboard/production-timeline"
import { AIAlerts } from "@/components/dashboard/ai-alerts"
import { ProductionOrdersTable } from "@/components/production-orders/production-orders-table"

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da produção em tempo real</p>
      </div>

      <KPICards />

      <div className="grid gap-6 md:grid-cols-2">
        <ProductionTimeline />
        <AIAlerts />
      </div>

      <ProductionOrdersTable />
    </div>
  )
}
