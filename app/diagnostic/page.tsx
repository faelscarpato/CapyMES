import { ConnectionDiagnostic } from "@/components/connection-diagnostic"

export default function DiagnosticPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico do Sistema</h1>
        <p className="text-muted-foreground">Verificação de conectividade e configuração do Supabase</p>
      </div>

      <div className="flex justify-center">
        <ConnectionDiagnostic />
      </div>
    </div>
  )
}
