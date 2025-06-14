"use client"

import { Plus, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddOrderDialog } from "./add-order-dialog"
import { useProductionOrders } from "@/hooks/use-production-orders"
import { useState } from "react"

export function ProductionOrdersTable() {
  const { orders, loading, isOnline, fetchOrders } = useProductionOrders()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em produção":
        return <Badge className="bg-blue-100 text-blue-800">Em produção</Badge>
      case "Concluída":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>
      case "Pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Crítica":
        return <Badge variant="destructive">Crítica</Badge>
      case "Alta":
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
      case "Normal":
        return <Badge variant="secondary">Normal</Badge>
      case "Baixa":
        return <Badge className="bg-gray-100 text-gray-800">Baixa</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const handleOrderAdded = () => {
    // Não precisa fazer nada, o hook já gerencia o estado
    console.log("Ordem adicionada com sucesso")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Ordens de Produção</CardTitle>
            {isOnline ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Carregando ordens...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">Nenhuma ordem de produção encontrada.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira ordem
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {order.product_name}
                        {order.id.startsWith("offline-") && (
                          <Badge variant="outline" className="text-xs">
                            Local
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AddOrderDialog open={showAddDialog} onOpenChange={setShowAddDialog} onOrderAdded={handleOrderAdded} />
    </Card>
  )
}
