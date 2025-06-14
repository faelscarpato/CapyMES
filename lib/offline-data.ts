import type {
  User,
  ProductionOrder,
  QualityInspection,
  MaintenanceOrder,
  TraceabilityRecord,
  AIAlert,
  SystemSetting,
  Equipment,
  ProductionLine,
} from "./types"

// Dados mockados para funcionamento offline
export const getMockUsers = (): User[] => [
  {
    id: "admin-001",
    name: "Administrador",
    email: "admin@capymes.com",
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-001",
    name: "João Silva",
    email: "joao@capymes.com",
    role: "supervisor",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "user-002",
    name: "Maria Santos",
    email: "maria@capymes.com",
    role: "operator",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "user-003",
    name: "Pedro Costa",
    email: "pedro@capymes.com",
    role: "operator",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "user-004",
    name: "Ana Oliveira",
    email: "ana@capymes.com",
    role: "quality",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: "user-005",
    name: "Carlos Ferreira",
    email: "carlos@capymes.com",
    role: "maintenance",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  },
]

export const getMockProductionLines = (): ProductionLine[] => [
  {
    id: "line-001",
    name: "Linha 1 - Montagem",
    description: "Linha principal de montagem de produtos",
    status: "active",
    capacity: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "line-002",
    name: "Linha 2 - Embalagem",
    description: "Linha de embalagem e acabamento",
    status: "active",
    capacity: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "line-003",
    name: "Linha 3 - Teste",
    description: "Linha de testes e controle de qualidade",
    status: "active",
    capacity: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const getMockEquipment = (): Equipment[] => [
  {
    id: "eq-001",
    name: "Esteira Principal",
    code: "EST-001",
    type: "Transporte",
    production_line_id: "line-001",
    status: "operational",
    last_maintenance: "2024-01-15",
    next_maintenance: "2024-04-15",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "eq-002",
    name: "Robot Soldador",
    code: "ROB-001",
    type: "Soldagem",
    production_line_id: "line-001",
    status: "operational",
    last_maintenance: "2024-02-01",
    next_maintenance: "2024-05-01",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "eq-003",
    name: "Máquina Embalagem",
    code: "EMB-001",
    type: "Embalagem",
    production_line_id: "line-002",
    status: "maintenance",
    last_maintenance: "2024-01-20",
    next_maintenance: "2024-04-20",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "eq-004",
    name: "Tester Automático",
    code: "TST-001",
    type: "Teste",
    production_line_id: "line-003",
    status: "operational",
    last_maintenance: "2024-02-10",
    next_maintenance: "2024-05-10",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const getMockProductionOrders = (): ProductionOrder[] => [
  {
    id: "po-001",
    order_number: "OP-2024-001",
    product_name: "Produto Alpha",
    product_code: "ALPHA-001",
    status: "Em produção",
    quantity: 100,
    produced_quantity: 65,
    priority: "Alta",
    production_line_id: "line-001",
    start_date: new Date(Date.now() - 7200000).toISOString(),
    estimated_duration: 480,
    created_by: "user-001",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "po-002",
    order_number: "OP-2024-002",
    product_name: "Produto Beta",
    product_code: "BETA-001",
    status: "Pendente",
    quantity: 50,
    produced_quantity: 0,
    priority: "Normal",
    production_line_id: "line-002",
    estimated_duration: 240,
    created_by: "user-002",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "po-003",
    order_number: "OP-2024-003",
    product_name: "Produto Gamma",
    product_code: "GAMMA-001",
    status: "Concluída",
    quantity: 75,
    produced_quantity: 75,
    priority: "Baixa",
    production_line_id: "line-001",
    start_date: new Date(Date.now() - 259200000).toISOString(),
    end_date: new Date(Date.now() - 86400000).toISOString(),
    estimated_duration: 360,
    actual_duration: 340,
    created_by: "user-001",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const getMockQualityInspections = (): QualityInspection[] => [
  {
    id: "qi-001",
    inspection_number: "QI-2024-001",
    production_order_id: "po-001",
    inspector_id: "user-004",
    inspection_type: "Inspeção Visual",
    status: "approved",
    sample_size: 10,
    defects_found: 0,
    conformity_rate: 100.0,
    observations: "Produto conforme especificações",
    inspection_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "qi-002",
    inspection_number: "QI-2024-002",
    production_order_id: "po-003",
    inspector_id: "user-004",
    inspection_type: "Teste Funcional",
    status: "approved",
    sample_size: 5,
    defects_found: 1,
    conformity_rate: 80.0,
    observations: "Um item com defeito menor",
    inspection_date: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "qi-003",
    inspection_number: "QI-2024-003",
    production_order_id: "po-001",
    inspector_id: "user-004",
    inspection_type: "Inspeção Dimensional",
    status: "pending",
    sample_size: 15,
    defects_found: 0,
    conformity_rate: 0.0,
    observations: "Aguardando inspeção",
    inspection_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const getMockMaintenanceOrders = (): MaintenanceOrder[] => [
  {
    id: "mo-001",
    order_number: "MO-2024-001",
    equipment_id: "eq-003",
    type: "corrective",
    priority: "Alta",
    status: "in_progress",
    description: "Substituição de correia transportadora",
    assigned_to: "user-005",
    scheduled_date: new Date(Date.now() + 3600000).toISOString(),
    estimated_hours: 4.0,
    created_by: "user-002",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mo-002",
    order_number: "MO-2024-002",
    equipment_id: "eq-002",
    type: "preventive",
    priority: "Normal",
    status: "open",
    description: "Manutenção preventiva mensal",
    assigned_to: "user-005",
    scheduled_date: new Date(Date.now() + 172800000).toISOString(),
    estimated_hours: 2.5,
    created_by: "user-001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mo-003",
    order_number: "MO-2024-003",
    equipment_id: "eq-004",
    type: "predictive",
    priority: "Baixa",
    status: "completed",
    description: "Calibração de sensores",
    assigned_to: "user-005",
    scheduled_date: new Date(Date.now() - 86400000).toISOString(),
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 82800000).toISOString(),
    estimated_hours: 1.5,
    actual_hours: 1.0,
    cost: 150.0,
    created_by: "user-002",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 82800000).toISOString(),
  },
]

export const getMockTraceabilityRecords = (): TraceabilityRecord[] => [
  {
    id: "tr-001",
    batch_number: "BATCH-2024-001",
    production_order_id: "po-001",
    equipment_id: "eq-001",
    operation: "Transporte Inicial",
    operator_id: "user-003",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    parameters: { speed: 1.2, temperature: 22 },
    quality_data: { weight: 1.5, dimensions: "10x5x3" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "tr-002",
    batch_number: "BATCH-2024-001",
    production_order_id: "po-001",
    equipment_id: "eq-002",
    operation: "Soldagem",
    operator_id: "user-003",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    parameters: { temperature: 350, pressure: 2.5 },
    quality_data: { weld_quality: "A", resistance: 95 },
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "tr-003",
    batch_number: "BATCH-2024-002",
    production_order_id: "po-003",
    equipment_id: "eq-004",
    operation: "Teste Final",
    operator_id: "user-003",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    parameters: { voltage: 12, current: 2.1 },
    quality_data: { pass: true, score: 98 },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const getMockAIAlerts = (): AIAlert[] => [
  {
    id: "alert-001",
    title: "Eficiência Baixa Detectada",
    message: "A linha de produção 1 está operando com 65% de eficiência. Recomenda-se verificação.",
    severity: "warning",
    category: "efficiency",
    source_table: "production_lines",
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "alert-002",
    title: "Manutenção Preventiva Vencida",
    message: "Equipamento EMB-001 está com manutenção preventiva vencida há 5 dias.",
    severity: "error",
    category: "maintenance",
    source_table: "equipment",
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "alert-003",
    title: "Meta de Produção Atingida",
    message: "Ordem OP-2024-003 foi concluída com sucesso!",
    severity: "success",
    category: "production",
    source_table: "production_orders",
    is_read: true,
    is_resolved: true,
    resolved_by: "user-001",
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "alert-004",
    title: "Qualidade Abaixo do Padrão",
    message: "Inspeção QI-2024-002 detectou taxa de conformidade de 80%. Investigar causa.",
    severity: "warning",
    category: "quality",
    source_table: "quality_inspections",
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "alert-005",
    title: "Equipamento em Manutenção",
    message: "Robot Soldador ROB-001 entrará em manutenção preventiva em 2 dias.",
    severity: "info",
    category: "maintenance",
    source_table: "equipment",
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
]

export const getMockSystemSettings = (): SystemSetting[] => [
  {
    id: "setting-001",
    key: "company_name",
    value: "CapyMEs Industries",
    description: "Nome da empresa",
    category: "general",
    updated_at: new Date().toISOString(),
  },
  {
    id: "setting-002",
    key: "oee_target",
    value: "85",
    description: "Meta de OEE em porcentagem",
    category: "production",
    updated_at: new Date().toISOString(),
  },
  {
    id: "setting-003",
    key: "quality_threshold",
    value: "95",
    description: "Limite mínimo de qualidade em porcentagem",
    category: "quality",
    updated_at: new Date().toISOString(),
  },
  {
    id: "setting-004",
    key: "maintenance_alert_days",
    value: "7",
    description: "Dias de antecedência para alertas de manutenção",
    category: "maintenance",
    updated_at: new Date().toISOString(),
  },
  {
    id: "setting-005",
    key: "shift_duration",
    value: "8",
    description: "Duração do turno em horas",
    category: "production",
    updated_at: new Date().toISOString(),
  },
]

// Funções para gerenciar dados offline
export class OfflineDataManager {
  private static getStorageKey(type: string): string {
    return `capymes_${type}`
  }

  static getData<T>(type: string, mockData: T[]): T[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(type))
      if (stored) {
        const parsedData = JSON.parse(stored)
        return Array.isArray(parsedData) ? parsedData : mockData
      }
      return mockData
    } catch (error) {
      console.warn(`Erro ao carregar dados ${type}:`, error)
      return mockData
    }
  }

  static saveData<T>(type: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(type), JSON.stringify(data))
    } catch (error) {
      console.warn(`Erro ao salvar dados ${type}:`, error)
    }
  }

  static addItem<T extends { id: string }>(type: string, item: T, mockData: T[]): T[] {
    const currentData = this.getData(type, mockData)
    const newData = [item, ...currentData]
    this.saveData(type, newData)
    return newData
  }

  static updateItem<T extends { id: string }>(type: string, id: string, updates: Partial<T>, mockData: T[]): T[] {
    const currentData = this.getData(type, mockData)
    const newData = currentData.map((item) => (item.id === id ? { ...item, ...updates } : item))
    this.saveData(type, newData)
    return newData
  }

  static deleteItem<T extends { id: string }>(type: string, id: string, mockData: T[]): T[] {
    const currentData = this.getData(type, mockData)
    const newData = currentData.filter((item) => item.id !== id)
    this.saveData(type, newData)
    return newData
  }
}
