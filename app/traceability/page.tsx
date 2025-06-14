"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw, Package, Clock, User, Settings } from "lucide-react"
import { traceabilityAPI, type TraceabilityRecord } from "@/lib/supabase"

export default function TraceabilityPage() {
  const [records, setRecords] = useState<TraceabilityRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<TraceabilityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchBatch, setSearchBatch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchBatch) {
      const filtered = records.filter((record) => record.batch_number.toLowerCase().includes(searchBatch.toLowerCase()))
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(records)
    }
  }, [searchBatch, records])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await traceabilityAPI.getAll()
      setRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error("Erro ao carregar dados de rastreabilidade:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchByBatch = async () => {
    if (!searchBatch.trim()) {
      setFilteredRecords(records)
      return
    }

    try {
      setLoading(true)
      const data = await traceabilityAPI.getByBatch(searchBatch.trim())
      setFilteredRecords(data)
    } catch (error) {
      console.error("Erro ao buscar por lote:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUniqueValues = (key: keyof TraceabilityRecord) => {
    return [...new Set(records.map((record) => record[key]).filter(Boolean))]
  }

  const uniqueBatches = getUniqueValues("batch_number")
  const uniqueOperations = getUniqueValues("operation")

  if (loading && records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rastreabilidade</h1>
          <p className="text-muted-foreground">Carregando dados de rastreabilidade...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rastreabilidade</h1>
          <p className="text-muted-foreground">Rastreamento completo da produção</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">Registros de rastreabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Únicos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBatches.length}</div>
            <p className="text-xs text-muted-foreground">Lotes rastreados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueOperations.length}</div>
            <p className="text-xs text-muted-foreground">Tipos de operação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Registro</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0 ? new Date(records[0].timestamp).toLocaleDateString("pt-BR") : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Data do último registro</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca por Lote */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar por Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Número do Lote</Label>
              <Input
                id="search"
                value={searchBatch}
                onChange={(e) => setSearchBatch(e.target.value)}
                placeholder="Digite o número do lote..."
                onKeyPress={(e) => e.key === "Enter" && searchByBatch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchByBatch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>

          {uniqueBatches.length > 0 && (
            <div className="mt-4">
              <Label>Lotes Disponíveis:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {uniqueBatches.slice(0, 10).map((batch) => (
                  <Badge
                    key={batch}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setSearchBatch(batch)}
                  >
                    {batch}
                  </Badge>
                ))}
                {uniqueBatches.length > 10 && <Badge variant="secondary">+{uniqueBatches.length - 10} mais</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros de Rastreabilidade
            {searchBatch && (
              <Badge variant="secondary" className="ml-2">
                Filtrado por: {searchBatch}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Ordem de Produção</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Parâmetros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">
                      {searchBatch
                        ? `Nenhum registro encontrado para o lote "${searchBatch}".`
                        : "Nenhum registro de rastreabilidade encontrado."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.batch_number}</TableCell>
                    <TableCell>{record.operation}</TableCell>
                    <TableCell>
                      {record.equipment?.name || "N/A"}
                      <br />
                      <span className="text-xs text-gray-500">{record.equipment?.code}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {record.operator?.name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.production_order?.order_number || "N/A"}
                      <br />
                      <span className="text-xs text-gray-500">{record.production_order?.product_name}</span>
                    </TableCell>
                    <TableCell>{new Date(record.timestamp).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      {record.parameters ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:underline">Ver parâmetros</summary>
                          <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto max-w-xs">
                            {JSON.stringify(record.parameters, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
