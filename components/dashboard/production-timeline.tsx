"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const timelineEvents = [
  {
    time: "08:00",
    event: "Início da produção - Linha 1",
    status: "completed",
    description: "Produto A iniciado",
  },
  {
    time: "09:30",
    event: "Troca de ferramenta - Linha 2",
    status: "completed",
    description: "Setup para Produto B",
  },
  {
    time: "11:15",
    event: "Parada para manutenção - Linha 3",
    status: "warning",
    description: "Manutenção preventiva programada",
  },
  {
    time: "14:00",
    event: "Retomada da produção - Linha 3",
    status: "active",
    description: "Produção normalizada",
  },
  {
    time: "15:30",
    event: "Inspeção de qualidade",
    status: "pending",
    description: "Lote #1247 aguardando inspeção",
  },
]

export function ProductionTimeline() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "pending":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Concluído
          </Badge>
        )
      case "active":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Ativo
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Atenção
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Produção</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />
                {index < timelineEvents.length - 1 && <div className="w-px h-8 bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.event}</p>
                  {getStatusBadge(event.status)}
                </div>
                <p className="text-sm text-gray-500">
                  {event.time} - {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
