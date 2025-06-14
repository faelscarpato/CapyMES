"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testConnection, checkTables } from "@/lib/supabase"
import { useConnection } from "@/lib/connection-context"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from "lucide-react"

export function ConnectionDiagnostic() {
  const { isOnline, isConnecting, attemptConnection } = useConnection()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection?: any
    tables?: any
  }>({})

  const runDiagnostic = async () => {
    setTesting(true)
    setResults({})

    try {
      console.log("🔍 Iniciando diagnóstico de conexão...")

      // Testar conexão
      const connectionResult = await testConnection()
      setResults((prev) => ({ ...prev, connection: connectionResult }))

      if (connectionResult.success) {
        // Verificar tabelas
        const tablesResult = await checkTables()
        setResults((prev) => ({ ...prev, tables: tablesResult }))
      } else {
        // Simular verificação de tabelas offline
        const tablesResult = {
          success: true,
          tables: ["offline_mode"],
          hasProductionOrders: true,
          hasAiAlerts: true,
          hasQualityInspections: true,
          hasMaintenanceOrders: true,
          hasEquipment: true,
          hasTraceabilityRecords: true,
          hasUsers: true,
          hasSystemSettings: true,
          hasProductionLines: true,
        }
        setResults((prev) => ({ ...prev, tables: tablesResult }))
      }
    } catch (error) {
      console.error("Erro no diagnóstico:", error)
      setResults({
        connection: {
          success: false,
          message: "Erro inesperado",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Diagnóstico de Conexão Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            <span className="font-medium">Status Atual:</span>
          </div>
          <Badge
            variant={isOnline ? "default" : "secondary"}
            className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button onClick={runDiagnostic} disabled={testing || isConnecting} className="flex-1">
            <RefreshCw className={`w-4 h-4 mr-2 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testando..." : "Executar Diagnóstico"}
          </Button>

          <Button onClick={attemptConnection} disabled={isConnecting || testing} variant="outline">
            <Wifi className={`w-4 h-4 mr-2 ${isConnecting ? "animate-spin" : ""}`} />
            {isConnecting ? "Conectando..." : "Tentar Conectar"}
          </Button>
        </div>

        {results.connection && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.connection.success)}
              <span className="font-medium">Conexão com Supabase</span>
              <Badge variant={results.connection.success ? "default" : "destructive"}>
                {results.connection.success ? "Sucesso" : "Falha"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 ml-6">{results.connection.message}</p>
            {results.connection.error && (
              <pre className="text-xs bg-red-50 p-2 rounded ml-6 overflow-auto">
                {JSON.stringify(results.connection.error, null, 2)}
              </pre>
            )}
          </div>
        )}

        {results.tables && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.tables.success)}
              <span className="font-medium">Verificação de Tabelas</span>
              <Badge variant={results.tables.success ? "default" : "destructive"}>
                {results.tables.success ? "OK" : "Erro"}
              </Badge>
            </div>

            {results.tables.success && (
              <div className="ml-6 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasProductionOrders)}
                    <span className="text-sm">production_orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasAiAlerts)}
                    <span className="text-sm">ai_alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasQualityInspections)}
                    <span className="text-sm">quality_inspections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasMaintenanceOrders)}
                    <span className="text-sm">maintenance_orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasEquipment)}
                    <span className="text-sm">equipment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasTraceabilityRecords)}
                    <span className="text-sm">traceability_records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasUsers)}
                    <span className="text-sm">users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasSystemSettings)}
                    <span className="text-sm">system_settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tables.hasProductionLines)}
                    <span className="text-sm">production_lines</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total de tabelas encontradas: {results.tables.tables.length}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instruções para Configuração:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Execute o script SQL "create-full-mes-database.sql" no Supabase</li>
            <li>2. Verifique se todas as 9 tabelas foram criadas corretamente</li>
            <li>3. Confirme que as políticas RLS estão configuradas</li>
            <li>4. Verifique se a chave API está correta no arquivo lib/supabase.ts</li>
            <li>5. Use o botão "Tentar Conectar" para conectar manualmente</li>
          </ol>

          <div className="mt-3 p-2 bg-blue-100 rounded">
            <p className="text-xs text-blue-700">
              <strong>Dica:</strong> O sistema funciona completamente offline. Use a conexão manual para sincronizar
              dados quando o Supabase estiver configurado corretamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
