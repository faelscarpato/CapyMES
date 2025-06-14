"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useConnection } from "@/lib/connection-context"
import { Wifi, WifiOff, Loader2, Settings, RefreshCw, AlertTriangle } from "lucide-react"

export function ConnectionStatus() {
  const {
    isOnline,
    isConnecting,
    lastConnectionAttempt,
    connectionError,
    attemptConnection,
    forceOffline,
    connectionMode,
    setConnectionMode,
  } = useConnection()

  const getStatusBadge = () => {
    if (isConnecting) {
      return (
        <Badge variant="secondary" className="ml-2">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Conectando...
        </Badge>
      )
    }

    if (isOnline) {
      return (
        <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-200">
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800 border-red-200">
        <WifiOff className="w-3 h-3 mr-1" />
        Offline
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2 ml-2">
      {getStatusBadge()}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Configurações de Conexão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Atual */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado:</span>
                  {getStatusBadge()}
                </div>

                {connectionError && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Erro de Conexão</p>
                      <p className="text-xs text-red-600">{connectionError}</p>
                    </div>
                  </div>
                )}

                {lastConnectionAttempt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última tentativa:</span>
                    <span className="text-xs text-gray-500">{lastConnectionAttempt.toLocaleTimeString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-connect">Conexão Automática</Label>
                    <p className="text-xs text-gray-500">Tentar conectar automaticamente ao Supabase</p>
                  </div>
                  <Switch
                    id="auto-connect"
                    checked={connectionMode === "auto"}
                    onCheckedChange={(checked) => setConnectionMode(checked ? "auto" : "manual")}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={attemptConnection}
                    disabled={isConnecting}
                    className="w-full"
                    variant={isOnline ? "outline" : "default"}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? "animate-spin" : ""}`} />
                    {isConnecting ? "Conectando..." : "Tentar Conectar"}
                  </Button>

                  {isOnline && (
                    <Button onClick={forceOffline} variant="outline" className="w-full">
                      <WifiOff className="w-4 h-4 mr-2" />
                      Forçar Modo Offline
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sobre os Modos de Conexão:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Modo Manual:</strong> Você controla quando conectar ao Supabase. O sistema funciona offline
                  por padrão.
                </p>
                <p>
                  <strong>Modo Automático:</strong> O sistema tenta conectar automaticamente e verifica a conexão
                  periodicamente.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {lastConnectionAttempt && (
        <span className="text-xs text-gray-500">{lastConnectionAttempt.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
