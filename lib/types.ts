export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "supervisor" | "operator" | "maintenance" | "quality"
  created_at: string
  updated_at: string
}

export type ProductionLine = {
  id: string
  name: string
  description?: string
  status: "active" | "inactive" | "maintenance"
  capacity: number
  created_at: string
  updated_at: string
}

export type Equipment = {
  id: string
  name: string
  code: string
  type: string
  production_line_id?: string
  status: "operational" | "maintenance" | "broken" | "idle"
  last_maintenance?: string
  next_maintenance?: string
  specifications?: any
  created_at: string
  updated_at: string
  production_line?: ProductionLine
}

export type ProductionOrder = {
  id: string
  order_number: string
  product_name: string
  product_code?: string
  status: "Em produção" | "Concluída" | "Pendente" | "Pausada" | "Cancelada"
  quantity: number
  produced_quantity: number
  priority: "Baixa" | "Normal" | "Alta" | "Crítica"
  production_line_id?: string
  start_date?: string
  end_date?: string
  estimated_duration?: number
  actual_duration?: number
  created_by?: string
  created_at: string
  updated_at: string
  production_line?: ProductionLine
  created_by_user?: User
}

export type QualityInspection = {
  id: string
  inspection_number: string
  production_order_id?: string
  inspector_id?: string
  inspection_type: string
  status: "pending" | "in_progress" | "approved" | "rejected" | "rework"
  sample_size: number
  defects_found: number
  conformity_rate: number
  observations?: string
  inspection_date: string
  created_at: string
  updated_at: string
  production_order?: ProductionOrder
  inspector?: User
}

export type MaintenanceOrder = {
  id: string
  order_number: string
  equipment_id?: string
  type: "preventive" | "corrective" | "predictive"
  priority: "Baixa" | "Normal" | "Alta" | "Crítica"
  status: "open" | "in_progress" | "completed" | "cancelled"
  description: string
  assigned_to?: string
  scheduled_date?: string
  started_at?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  cost?: number
  parts_used?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  equipment?: Equipment
  assigned_user?: User
  created_by_user?: User
}

export type TraceabilityRecord = {
  id: string
  batch_number: string
  production_order_id?: string
  equipment_id?: string
  operation: string
  operator_id?: string
  timestamp: string
  parameters?: any
  quality_data?: any
  notes?: string
  created_at: string
  production_order?: ProductionOrder
  equipment?: Equipment
  operator?: User
}

export type AIAlert = {
  id: string
  title: string
  message: string
  severity: "info" | "warning" | "error" | "success"
  category: "production" | "quality" | "maintenance" | "efficiency" | "general"
  source_table?: string
  source_id?: string
  is_read: boolean
  is_resolved: boolean
  resolved_by?: string
  resolved_at?: string
  created_at: string
  resolved_by_user?: User
}

export type SystemSetting = {
  id: string
  key: string
  value: string
  description?: string
  category: string
  updated_by?: string
  updated_at: string
  updated_by_user?: User
}
