import { ProductionOrdersTable } from "@/components/production-orders/production-orders-table"

export default function ProductionOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ordens de Produção</h1>
        <p className="text-muted-foreground">Gerencie todas as ordens de produção do sistema</p>
      </div>

      <ProductionOrdersTable />
    </div>
  )
}
