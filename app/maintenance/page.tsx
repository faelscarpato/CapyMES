"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { maintenanceAPI, type MaintenanceOrder } from "@/lib/supabase"
import { AddMaintenanceDialog } from "@/components/maintenance/add-maintenance-dialog"

export default function MaintenancePage() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersData, statsData] = await Promise.all([maintenanceAPI.getAll(), maintenanceAPI.getStats()])

      setOrders(ordersData)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar dados de manutenção:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Aberta", variant: "secondary", icon: Clock },
      in_progress: { label: "Em Andamento", variant: "default", icon: Wrench, className: "bg-blue-100 text-blue-800" },
      completed: {
        label: "Concluída",
        variant: "default",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800",
      },
      cancelled: { label: "Cancelada", variant: "destructive", icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      preventive: { label: "Preventiva", className: "bg-green-100 text-green-800" },
      corrective: { label: "Corretiva", className: "bg-red-100 text-red-800" },
      predictive: { label: "Preditiva", className: "bg-blue-100 text-blue-800" },
    }

    const config = typeConfig[type as keyof typeof typeConfig]
    return (
      <Badge variant="secondary" className={config?.className}>
        {config?.label || type}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      Crítica: { variant: "destructive" },
      Alta: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
      Normal: { variant: "secondary" },
      Baixa: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.Normal
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {priority}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenção</h1>
          <p className="text-muted-foreground">Carregando dados de manutenção...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenção</h1>
          <p className="text-muted-foreground">Gestão de manutenção preventiva e corretiva</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ordem
          </Button>
        </div>
      </div>

      {/* KPIs de Manutenção */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens Abertas</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
              <p className="text-xs text-muted-foreground">Aguardando execução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Sendo executadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgHours}h</div>
              <p className="text-xs text-muted-foreground">Tempo médio de execução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Custo acumulado</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Ordens de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Agendado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Nenhuma ordem de manutenção encontrada.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira ordem
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      {order.equipment?.name || "N/A"}
                      <br />
                      <span className="text-xs text-gray-500">{order.equipment?.code}</span>
                    </TableCell>
                    <TableCell>{getTypeBadge(order.type)}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.assigned_user?.name || "Não atribuído"}</TableCell>
                    <TableCell>
                      {order.scheduled_date
                        ? new Date(order.scheduled_date).toLocaleDateString("pt-BR")
                        : "Não agendado"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddMaintenanceDialog open={showAddDialog} onOpenChange={setShowAddDialog} onOrderAdded={fetchData} />
    </div>
  )
}
