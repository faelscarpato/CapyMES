import { createClient } from "@supabase/supabase-js"
import type {
  User,
  ProductionLine,
  Equipment,
  ProductionOrder,
  QualityInspection,
  MaintenanceOrder,
  TraceabilityRecord,
  AIAlert,
  SystemSetting,
} from "./types"
import {
  getMockUsers,
  getMockProductionLines,
  getMockEquipment,
  getMockProductionOrders,
  getMockQualityInspections,
  getMockMaintenanceOrders,
  getMockTraceabilityRecords,
  getMockAIAlerts,
  getMockSystemSettings,
  OfflineDataManager,
} from "./offline-data"

const supabaseUrl = "https://iehlibnauegluxbgvuso.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaGxpYm5hdWVnbHV4Ymd2dXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzYwODMsImV4cCI6MjA2MDQ1MjA4M30.M0JZPk0xfcSCeN56Nb3MGwfE2dEhHomeDdJQbYi8SP8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Exportar tipos
export type {
  User,
  ProductionLine,
  Equipment,
  ProductionOrder,
  QualityInspection,
  MaintenanceOrder,
  TraceabilityRecord,
  AIAlert,
  SystemSetting,
}

// Função para testar conexão com timeout real
export async function testConnection(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    if (!navigator.onLine) {
      return { success: false, message: "Sem conexão com a internet" }
    }

    console.log("🔄 Testando conexão com Supabase...")

    // Criar uma promise com timeout de 10 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout na conexão (10s)")), 10000)
    })

    const queryPromise = supabase.from("production_orders").select("*", { count: "exact", head: true })

    const result = (await Promise.race([queryPromise, timeoutPromise])) as any

    if (result.error) {
      return {
        success: false,
        message: `Erro do Supabase: ${result.error.message}`,
        error: result.error,
      }
    }

    return {
      success: true,
      message: `Conectado com sucesso (${result.count || 0} registros)`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return {
      success: false,
      message: `Falha na conexão: ${errorMessage}`,
      error: errorMessage,
    }
  }
}

// Função para verificar se as tabelas existem
export async function checkTables() {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout na verificação de tabelas")), 10000)
    })

    const queryPromise = supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", [
        "production_orders",
        "ai_alerts",
        "quality_inspections",
        "maintenance_orders",
        "equipment",
        "traceability_records",
        "users",
        "system_settings",
        "production_lines",
      ])

    const { data: tables, error } = (await Promise.race([queryPromise, timeoutPromise])) as any

    if (error) {
      console.error("Erro ao verificar tabelas:", error)
      return { success: false, tables: [] }
    }

    const tableNames = tables?.map((t: any) => t.table_name) || []
    console.log("Tabelas encontradas:", tableNames)

    return {
      success: true,
      tables: tableNames,
      hasProductionOrders: tableNames.includes("production_orders"),
      hasAiAlerts: tableNames.includes("ai_alerts"),
      hasQualityInspections: tableNames.includes("quality_inspections"),
      hasMaintenanceOrders: tableNames.includes("maintenance_orders"),
      hasEquipment: tableNames.includes("equipment"),
      hasTraceabilityRecords: tableNames.includes("traceability_records"),
      hasUsers: tableNames.includes("users"),
      hasSystemSettings: tableNames.includes("system_settings"),
      hasProductionLines: tableNames.includes("production_lines"),
    }
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error)
    return { success: false, tables: [] }
  }
}

// Helper function para executar queries com fallback offline
async function executeQuery<T>(queryFn: () => Promise<any>, fallbackData: T[] = [], isOnline = false): Promise<T[]> {
  // Se estiver offline, usar dados mockados
  if (!isOnline) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200)) // Simular delay
    return fallbackData
  }

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000)
    })

    const result = (await Promise.race([queryFn(), timeoutPromise])) as any

    if (result.error) {
      console.warn("Erro na query, usando dados offline:", result.error)
      return fallbackData
    }

    return result.data || fallbackData
  } catch (error) {
    console.warn("Erro ao executar query, usando dados offline:", error)
    return fallbackData
  }
}

// Função para verificar se está online (será usada pelos componentes)
export function getConnectionStatus(): boolean {
  // Esta função será sobrescrita pelo contexto de conexão
  return false
}

// Funções para Production Orders
export const productionOrdersAPI = {
  async getAll(isOnline = false): Promise<ProductionOrder[]> {
    if (isOnline) {
      const data = await executeQuery<ProductionOrder>(
        () =>
          supabase
            .from("production_orders")
            .select(`
              *,
              production_line:production_lines(*),
              created_by_user:users(*)
            `)
            .order("created_at", { ascending: false }),
        getMockProductionOrders(),
        isOnline,
      )

      // Se conseguiu dados do Supabase, salvar localmente como backup
      if (data.length > 0 && data !== getMockProductionOrders()) {
        OfflineDataManager.saveData("production_orders_backup", data)
      }

      return data
    }

    // Modo offline - usar dados locais + mockados
    const orders = OfflineDataManager.getData("production_orders", getMockProductionOrders())
    const lines = OfflineDataManager.getData("production_lines", getMockProductionLines())
    const users = OfflineDataManager.getData("users", getMockUsers())

    return orders.map((order) => ({
      ...order,
      production_line: lines.find((l) => l.id === order.production_line_id),
      created_by_user: users.find((u) => u.id === order.created_by),
    }))
  },

  async create(
    order: Omit<ProductionOrder, "id" | "created_at" | "updated_at">,
    isOnline = false,
  ): Promise<ProductionOrder> {
    const newOrder: ProductionOrder = {
      ...order,
      id: `po-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("production_orders").insert([order]).select().single()
        if (!error && data) {
          // Atualizar dados locais também
          OfflineDataManager.addItem("production_orders", data, getMockProductionOrders())
          return data as ProductionOrder
        }
      } catch (error) {
        console.warn("Erro ao criar no Supabase, salvando localmente:", error)
      }
    }

    // Salvar localmente
    OfflineDataManager.addItem("production_orders", newOrder, getMockProductionOrders())
    return newOrder
  },

  async update(id: string, updates: Partial<ProductionOrder>, isOnline = false): Promise<ProductionOrder> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("production_orders")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()

        if (!error && data) {
          // Atualizar dados locais também
          OfflineDataManager.updateItem("production_orders", id, updateData, getMockProductionOrders())
          return data as ProductionOrder
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    // Atualizar localmente
    const updatedData = OfflineDataManager.updateItem("production_orders", id, updateData, getMockProductionOrders())
    const updatedOrder = updatedData.find((o) => o.id === id)
    if (!updatedOrder) throw new Error("Order not found")
    return updatedOrder
  },

  async delete(id: string, isOnline = false): Promise<void> {
    if (isOnline) {
      try {
        const { error } = await supabase.from("production_orders").delete().eq("id", id)
        if (!error) {
          // Remover dos dados locais também
          OfflineDataManager.deleteItem("production_orders", id, getMockProductionOrders())
          return
        }
      } catch (error) {
        console.warn("Erro ao deletar no Supabase, removendo localmente:", error)
      }
    }

    // Remover localmente
    OfflineDataManager.deleteItem("production_orders", id, getMockProductionOrders())
  },
}

// Aplicar o mesmo padrão para as outras APIs...
export const qualityAPI = {
  async getAll(isOnline = false): Promise<QualityInspection[]> {
    if (isOnline) {
      const data = await executeQuery<QualityInspection>(
        () =>
          supabase
            .from("quality_inspections")
            .select(`
              *,
              production_order:production_orders(*),
              inspector:users(*)
            `)
            .order("created_at", { ascending: false }),
        getMockQualityInspections(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockQualityInspections()) {
        OfflineDataManager.saveData("quality_inspections_backup", data)
      }

      return data
    }

    const inspections = OfflineDataManager.getData("quality_inspections", getMockQualityInspections())
    const orders = OfflineDataManager.getData("production_orders", getMockProductionOrders())
    const users = OfflineDataManager.getData("users", getMockUsers())

    return inspections.map((inspection) => ({
      ...inspection,
      production_order: orders.find((o) => o.id === inspection.production_order_id),
      inspector: users.find((u) => u.id === inspection.inspector_id),
    }))
  },

  async create(
    inspection: Omit<QualityInspection, "id" | "created_at" | "updated_at">,
    isOnline = false,
  ): Promise<QualityInspection> {
    const newInspection: QualityInspection = {
      ...inspection,
      id: `qi-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("quality_inspections").insert([inspection]).select().single()
        if (!error && data) {
          OfflineDataManager.addItem("quality_inspections", data, getMockQualityInspections())
          return data as QualityInspection
        }
      } catch (error) {
        console.warn("Erro ao criar no Supabase, salvando localmente:", error)
      }
    }

    OfflineDataManager.addItem("quality_inspections", newInspection, getMockQualityInspections())
    return newInspection
  },

  async update(id: string, updates: Partial<QualityInspection>, isOnline = false): Promise<QualityInspection> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("quality_inspections")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()

        if (!error && data) {
          OfflineDataManager.updateItem("quality_inspections", id, updateData, getMockQualityInspections())
          return data as QualityInspection
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem(
      "quality_inspections",
      id,
      updateData,
      getMockQualityInspections(),
    )
    const updatedInspection = updatedData.find((i) => i.id === id)
    if (!updatedInspection) throw new Error("Inspection not found")
    return updatedInspection
  },

  async getStats(isOnline = false) {
    const data = await this.getAll(isOnline)

    const total = data.length
    const approved = data.filter((i) => i.status === "approved").length
    const rejected = data.filter((i) => i.status === "rejected").length
    const pending = data.filter((i) => i.status === "pending").length
    const avgConformity = data.reduce((acc, i) => acc + i.conformity_rate, 0) / total || 0

    return {
      total,
      approved,
      rejected,
      pending,
      avgConformity: Math.round(avgConformity * 100) / 100,
      approvalRate: Math.round((approved / total) * 100) || 0,
    }
  },
}

// Continuar com as outras APIs seguindo o mesmo padrão...
export const maintenanceAPI = {
  async getAll(isOnline = false): Promise<MaintenanceOrder[]> {
    if (isOnline) {
      const data = await executeQuery<MaintenanceOrder>(
        () =>
          supabase
            .from("maintenance_orders")
            .select(`
              *,
              equipment:equipment(*),
              assigned_user:users!assigned_to(*),
              created_by_user:users!created_by(*)
            `)
            .order("created_at", { ascending: false }),
        getMockMaintenanceOrders(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockMaintenanceOrders()) {
        OfflineDataManager.saveData("maintenance_orders_backup", data)
      }

      return data
    }

    const orders = OfflineDataManager.getData("maintenance_orders", getMockMaintenanceOrders())
    const equipment = OfflineDataManager.getData("equipment", getMockEquipment())
    const users = OfflineDataManager.getData("users", getMockUsers())

    return orders.map((order) => ({
      ...order,
      equipment: equipment.find((e) => e.id === order.equipment_id),
      assigned_user: users.find((u) => u.id === order.assigned_to),
      created_by_user: users.find((u) => u.id === order.created_by),
    }))
  },

  async create(
    order: Omit<MaintenanceOrder, "id" | "created_at" | "updated_at">,
    isOnline = false,
  ): Promise<MaintenanceOrder> {
    const newOrder: MaintenanceOrder = {
      ...order,
      id: `mo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("maintenance_orders").insert([order]).select().single()
        if (!error && data) {
          OfflineDataManager.addItem("maintenance_orders", data, getMockMaintenanceOrders())
          return data as MaintenanceOrder
        }
      } catch (error) {
        console.warn("Erro ao criar no Supabase, salvando localmente:", error)
      }
    }

    OfflineDataManager.addItem("maintenance_orders", newOrder, getMockMaintenanceOrders())
    return newOrder
  },

  async update(id: string, updates: Partial<MaintenanceOrder>, isOnline = false): Promise<MaintenanceOrder> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("maintenance_orders")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()

        if (!error && data) {
          OfflineDataManager.updateItem("maintenance_orders", id, updateData, getMockMaintenanceOrders())
          return data as MaintenanceOrder
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem("maintenance_orders", id, updateData, getMockMaintenanceOrders())
    const updatedOrder = updatedData.find((o) => o.id === id)
    if (!updatedOrder) throw new Error("Order not found")
    return updatedOrder
  },

  async getStats(isOnline = false) {
    const data = await this.getAll(isOnline)

    const total = data.length
    const open = data.filter((m) => m.status === "open").length
    const inProgress = data.filter((m) => m.status === "in_progress").length
    const completed = data.filter((m) => m.status === "completed").length
    const avgHours = data.reduce((acc, m) => acc + (m.actual_hours || 0), 0) / completed || 0
    const totalCost = data.reduce((acc, m) => acc + (m.cost || 0), 0)

    return {
      total,
      open,
      inProgress,
      completed,
      avgHours: Math.round(avgHours * 100) / 100,
      totalCost,
    }
  },
}

// Implementar as outras APIs seguindo o mesmo padrão...
export const equipmentAPI = {
  async getAll(isOnline = false): Promise<Equipment[]> {
    if (isOnline) {
      const data = await executeQuery<Equipment>(
        () =>
          supabase
            .from("equipment")
            .select(`
              *,
              production_line:production_lines(*)
            `)
            .order("name"),
        getMockEquipment(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockEquipment()) {
        OfflineDataManager.saveData("equipment_backup", data)
      }

      return data
    }

    const equipment = OfflineDataManager.getData("equipment", getMockEquipment())
    const lines = OfflineDataManager.getData("production_lines", getMockProductionLines())

    return equipment.map((eq) => ({
      ...eq,
      production_line: lines.find((l) => l.id === eq.production_line_id),
    }))
  },

  async create(equipment: Omit<Equipment, "id" | "created_at" | "updated_at">, isOnline = false): Promise<Equipment> {
    const newEquipment: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("equipment").insert([equipment]).select().single()
        if (!error && data) {
          OfflineDataManager.addItem("equipment", data, getMockEquipment())
          return data as Equipment
        }
      } catch (error) {
        console.warn("Erro ao criar no Supabase, salvando localmente:", error)
      }
    }

    OfflineDataManager.addItem("equipment", newEquipment, getMockEquipment())
    return newEquipment
  },

  async update(id: string, updates: Partial<Equipment>, isOnline = false): Promise<Equipment> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("equipment").update(updateData).eq("id", id).select().single()

        if (!error && data) {
          OfflineDataManager.updateItem("equipment", id, updateData, getMockEquipment())
          return data as Equipment
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem("equipment", id, updateData, getMockEquipment())
    const updatedEquipment = updatedData.find((e) => e.id === id)
    if (!updatedEquipment) throw new Error("Equipment not found")
    return updatedEquipment
  },
}

export const traceabilityAPI = {
  async getAll(isOnline = false): Promise<TraceabilityRecord[]> {
    if (isOnline) {
      const data = await executeQuery<TraceabilityRecord>(
        () =>
          supabase
            .from("traceability_records")
            .select(`
              *,
              production_order:production_orders(*),
              equipment:equipment(*),
              operator:users(*)
            `)
            .order("timestamp", { ascending: false }),
        getMockTraceabilityRecords(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockTraceabilityRecords()) {
        OfflineDataManager.saveData("traceability_records_backup", data)
      }

      return data
    }

    const records = OfflineDataManager.getData("traceability_records", getMockTraceabilityRecords())
    const orders = OfflineDataManager.getData("production_orders", getMockProductionOrders())
    const equipment = OfflineDataManager.getData("equipment", getMockEquipment())
    const users = OfflineDataManager.getData("users", getMockUsers())

    return records.map((record) => ({
      ...record,
      production_order: orders.find((o) => o.id === record.production_order_id),
      equipment: equipment.find((e) => e.id === record.equipment_id),
      operator: users.find((u) => u.id === record.operator_id),
    }))
  },

  async create(record: Omit<TraceabilityRecord, "id" | "created_at">, isOnline = false): Promise<TraceabilityRecord> {
    const newRecord: TraceabilityRecord = {
      ...record,
      id: `tr-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("traceability_records").insert([record]).select().single()
        if (!error && data) {
          OfflineDataManager.addItem("traceability_records", data, getMockTraceabilityRecords())
          return data as TraceabilityRecord
        }
      } catch (error) {
        console.warn("Erro ao criar no Supabase, salvando localmente:", error)
      }
    }

    OfflineDataManager.addItem("traceability_records", newRecord, getMockTraceabilityRecords())
    return newRecord
  },

  async getByBatch(batchNumber: string, isOnline = false): Promise<TraceabilityRecord[]> {
    const allRecords = await this.getAll(isOnline)
    return allRecords.filter((record) => record.batch_number.toLowerCase().includes(batchNumber.toLowerCase()))
  },
}

export const alertsAPI = {
  async getAll(isOnline = false): Promise<AIAlert[]> {
    if (isOnline) {
      const data = await executeQuery<AIAlert>(
        () =>
          supabase
            .from("ai_alerts")
            .select(`
              *,
              resolved_by_user:users(*)
            `)
            .order("created_at", { ascending: false }),
        getMockAIAlerts(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockAIAlerts()) {
        OfflineDataManager.saveData("ai_alerts_backup", data)
      }

      return data
    }

    const alerts = OfflineDataManager.getData("ai_alerts", getMockAIAlerts())
    const users = OfflineDataManager.getData("users", getMockUsers())

    return alerts.map((alert) => ({
      ...alert,
      resolved_by_user: users.find((u) => u.id === alert.resolved_by),
    }))
  },

  async markAsRead(id: string, isOnline = false): Promise<AIAlert> {
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("ai_alerts")
          .update({ is_read: true })
          .eq("id", id)
          .select()
          .single()
        if (!error && data) {
          OfflineDataManager.updateItem("ai_alerts", id, { is_read: true }, getMockAIAlerts())
          return data as AIAlert
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem("ai_alerts", id, { is_read: true }, getMockAIAlerts())
    const updatedAlert = updatedData.find((a) => a.id === id)
    if (!updatedAlert) throw new Error("Alert not found")
    return updatedAlert
  },

  async resolve(id: string, resolvedBy: string, isOnline = false): Promise<AIAlert> {
    const updateData = {
      is_resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase.from("ai_alerts").update(updateData).eq("id", id).select().single()

        if (!error && data) {
          OfflineDataManager.updateItem("ai_alerts", id, updateData, getMockAIAlerts())
          return data as AIAlert
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem("ai_alerts", id, updateData, getMockAIAlerts())
    const updatedAlert = updatedData.find((a) => a.id === id)
    if (!updatedAlert) throw new Error("Alert not found")
    return updatedAlert
  },
}

export const settingsAPI = {
  async getAll(isOnline = false): Promise<SystemSetting[]> {
    if (isOnline) {
      const data = await executeQuery<SystemSetting>(
        () => supabase.from("system_settings").select("*").order("category", { ascending: true }),
        getMockSystemSettings(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockSystemSettings()) {
        OfflineDataManager.saveData("system_settings_backup", data)
      }

      return data
    }

    return OfflineDataManager.getData("system_settings", getMockSystemSettings())
  },

  async update(key: string, value: string, updatedBy: string, isOnline = false): Promise<SystemSetting> {
    const settings = await this.getAll(isOnline)
    const settingToUpdate = settings.find((s) => s.key === key)

    if (!settingToUpdate) throw new Error("Setting not found")

    const updateData = {
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .update(updateData)
          .eq("key", key)
          .select()
          .single()

        if (!error && data) {
          OfflineDataManager.updateItem("system_settings", settingToUpdate.id, updateData, getMockSystemSettings())
          return data as SystemSetting
        }
      } catch (error) {
        console.warn("Erro ao atualizar no Supabase, atualizando localmente:", error)
      }
    }

    const updatedData = OfflineDataManager.updateItem(
      "system_settings",
      settingToUpdate.id,
      updateData,
      getMockSystemSettings(),
    )
    const updatedSetting = updatedData.find((s) => s.id === settingToUpdate.id)
    if (!updatedSetting) throw new Error("Setting not found after update")
    return updatedSetting
  },
}

export const usersAPI = {
  async getAll(isOnline = false): Promise<User[]> {
    if (isOnline) {
      const data = await executeQuery<User>(
        () => supabase.from("users").select("*").order("name"),
        getMockUsers(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockUsers()) {
        OfflineDataManager.saveData("users_backup", data)
      }

      return data
    }

    return OfflineDataManager.getData("users", getMockUsers())
  },
}

export const productionLinesAPI = {
  async getAll(isOnline = false): Promise<ProductionLine[]> {
    if (isOnline) {
      const data = await executeQuery<ProductionLine>(
        () => supabase.from("production_lines").select("*").order("name"),
        getMockProductionLines(),
        isOnline,
      )

      if (data.length > 0 && data !== getMockProductionLines()) {
        OfflineDataManager.saveData("production_lines_backup", data)
      }

      return data
    }

    return OfflineDataManager.getData("production_lines", getMockProductionLines())
  },
}
