"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { qualityAPI, type QualityInspection } from "@/lib/supabase"
import { AddInspectionDialog } from "@/components/quality/add-inspection-dialog"

export default function QualityPage() {
  const [inspections, setInspections] = useState<QualityInspection[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [inspectionsData, statsData] = await Promise.all([qualityAPI.getAll(), qualityAPI.getStats()])

      setInspections(inspectionsData)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar dados de qualidade:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary", icon: Clock },
      in_progress: { label: "Em Andamento", variant: "default", icon: RefreshCw },
      approved: { label: "Aprovado", variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejeitado", variant: "destructive", icon: XCircle },
      rework: {
        label: "Retrabalho",
        variant: "secondary",
        icon: AlertTriangle,
        className: "bg-yellow-100 text-yellow-800",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getConformityColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qualidade</h1>
          <p className="text-muted-foreground">Carregando dados de qualidade...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qualidade</h1>
          <p className="text-muted-foreground">Controle de qualidade e inspeções</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Inspeção
          </Button>
        </div>
      </div>

      {/* KPIs de Qualidade */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inspeções</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Inspeções realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.approved} de {stats.total} aprovadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conformidade Média</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getConformityColor(stats.avgConformity)}`}>
                {stats.avgConformity}%
              </div>
              <p className="text-xs text-muted-foreground">Taxa média de conformidade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Inspeções aguardando</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Inspeções */}
      <Card>
        <CardHeader>
          <CardTitle>Inspeções de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ordem de Produção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conformidade</TableHead>
                <TableHead>Inspetor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Nenhuma inspeção encontrada.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira inspeção
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-medium">{inspection.inspection_number}</TableCell>
                    <TableCell>{inspection.inspection_type}</TableCell>
                    <TableCell>
                      {inspection.production_order?.order_number || "N/A"}
                      <br />
                      <span className="text-xs text-gray-500">{inspection.production_order?.product_name}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getConformityColor(inspection.conformity_rate)}`}>
                        {inspection.conformity_rate}%
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {inspection.defects_found} defeitos em {inspection.sample_size} amostras
                      </span>
                    </TableCell>
                    <TableCell>{inspection.inspector?.name || "N/A"}</TableCell>
                    <TableCell>{new Date(inspection.inspection_date).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddInspectionDialog open={showAddDialog} onOpenChange={setShowAddDialog} onInspectionAdded={fetchData} />
    </div>
  )
}
