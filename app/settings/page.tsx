"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, SettingsIcon, AlertTriangle } from "lucide-react"
import { settingsAPI, usersAPI, testConnection, type SystemSetting, type User } from "@/lib/supabase"

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setConnectionError(null)

      // Primeiro, testar a conexão
      const connectionTest = await testConnection()

      if (!connectionTest.success) {
        setConnectionError(connectionTest.message)
        // Usar dados mockados se não houver conexão
        setSettings(getMockSettings())
        setUsers(getMockUsers())
        return
      }

      // Se a conexão estiver OK, tentar buscar dados reais
      try {
        const [settingsData, usersData] = await Promise.all([settingsAPI.getAll(), usersAPI.getAll()])

        setSettings(settingsData.length > 0 ? settingsData : getMockSettings())
        setUsers(usersData.length > 0 ? usersData : getMockUsers())
      } catch (apiError) {
        console.warn("Erro ao buscar dados da API, usando dados mockados:", apiError)
        setSettings(getMockSettings())
        setUsers(getMockUsers())
        setConnectionError("Tabelas não encontradas - usando dados de demonstração")
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      setConnectionError("Erro de conexão - usando dados de demonstração")
      setSettings(getMockSettings())
      setUsers(getMockUsers())
    } finally {
      setLoading(false)
    }
  }

  const getMockSettings = (): SystemSetting[] => [
    {
      id: "mock-1",
      key: "company_name",
      value: "CapyMEs Industries",
      description: "Nome da empresa",
      category: "general",
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-2",
      key: "oee_target",
      value: "85",
      description: "Meta de OEE em porcentagem",
      category: "production",
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-3",
      key: "quality_threshold",
      value: "95",
      description: "Limite mínimo de qualidade em porcentagem",
      category: "quality",
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-4",
      key: "maintenance_alert_days",
      value: "7",
      description: "Dias de antecedência para alertas de manutenção",
      category: "maintenance",
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-5",
      key: "shift_duration",
      value: "8",
      description: "Duração do turno em horas",
      category: "production",
      updated_at: new Date().toISOString(),
    },
  ]

  const getMockUsers = (): User[] => [
    {
      id: "mock-user-1",
      name: "João Silva",
      email: "joao@capymes.com",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-user-2",
      name: "Maria Santos",
      email: "maria@capymes.com",
      role: "supervisor",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "mock-user-3",
      name: "Pedro Costa",
      email: "pedro@capymes.com",
      role: "operator",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(key)

      // Se for um setting mockado, apenas atualizar localmente
      if (key.startsWith("mock-") || connectionError) {
        setSettings((prev) =>
          prev.map((setting) =>
            setting.key === key ? { ...setting, value, updated_at: new Date().toISOString() } : setting,
          ),
        )
        alert("Configuração atualizada localmente (modo demonstração)!")
        return
      }

      // Tentar atualizar no banco
      const currentUser = users.find((u) => u.role === "admin") || users[0]

      if (!currentUser) {
        throw new Error("Usuário não encontrado")
      }

      await settingsAPI.update(key, value, currentUser.id)

      setSettings((prev) =>
        prev.map((setting) =>
          setting.key === key ? { ...setting, value, updated_at: new Date().toISOString() } : setting,
        ),
      )

      alert("Configuração atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error)

      // Atualizar localmente mesmo com erro
      setSettings((prev) =>
        prev.map((setting) =>
          setting.key === key ? { ...setting, value, updated_at: new Date().toISOString() } : setting,
        ),
      )

      alert("Configuração atualizada localmente. Erro ao sincronizar com o servidor.")
    } finally {
      setSaving(null)
    }
  }

  const groupedSettings = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    },
    {} as Record<string, SystemSetting[]>,
  )

  const getCategoryTitle = (category: string) => {
    const titles = {
      general: "Geral",
      production: "Produção",
      quality: "Qualidade",
      maintenance: "Manutenção",
    }
    return titles[category as keyof typeof titles] || category
  }

  const getCategoryIcon = (category: string) => {
    return <SettingsIcon className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Carregando configurações do sistema...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Configurações do sistema e preferências</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alerta de Conexão */}
      {connectionError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Modo Demonstração</p>
                <p className="text-sm text-yellow-700">{connectionError}. As configurações serão salvas localmente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Versão do Sistema</Label>
              <p className="text-sm text-gray-600">CapyMEs v1.0.0</p>
            </div>
            <div>
              <Label>Última Atualização</Label>
              <p className="text-sm text-gray-600">{new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <Label>Usuários Cadastrados</Label>
              <p className="text-sm text-gray-600">{users.length} usuários</p>
            </div>
            <div>
              <Label>Status do Banco</Label>
              <Badge
                variant={connectionError ? "secondary" : "default"}
                className={connectionError ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
              >
                {connectionError ? "Modo Demo" : "Conectado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações por Categoria */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {getCategoryTitle(category)}
              {connectionError && (
                <Badge variant="outline" className="text-xs">
                  Demo
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySettings.map((setting) => (
              <SettingItem
                key={setting.key}
                setting={setting}
                onUpdate={updateSetting}
                saving={saving === setting.key}
                isDemo={!!connectionError}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Usuários do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Usuários do Sistema
            {connectionError && (
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.role}</Badge>
                  {user.id.startsWith("mock-") && (
                    <Badge variant="outline" className="text-xs">
                      Demo
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SettingItemProps {
  setting: SystemSetting
  onUpdate: (key: string, value: string) => void
  saving: boolean
  isDemo?: boolean
}

function SettingItem({ setting, onUpdate, saving, isDemo }: SettingItemProps) {
  const [value, setValue] = useState(setting.value)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setValue(setting.value)
    setHasChanges(false)
  }, [setting.value])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    setHasChanges(newValue !== setting.value)
  }

  const handleSave = () => {
    onUpdate(setting.key, value)
    setHasChanges(false)
  }

  const isTextArea = setting.description && setting.description.length > 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={setting.key} className="font-medium">
          {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          {isDemo && (
            <Badge variant="outline" className="ml-2 text-xs">
              Demo
            </Badge>
          )}
        </Label>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-3 h-3 mr-1" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        )}
      </div>

      {isTextArea ? (
        <Textarea
          id={setting.key}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={setting.description}
        />
      ) : (
        <Input
          id={setting.key}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={setting.description}
        />
      )}

      {setting.description && <p className="text-xs text-gray-500">{setting.description}</p>}

      {setting.updated_at && (
        <p className="text-xs text-gray-400">
          Última atualização: {new Date(setting.updated_at).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  )
}
