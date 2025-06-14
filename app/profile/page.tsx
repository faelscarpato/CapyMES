"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Shield, Calendar, Eye, EyeOff, Save } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      supervisor: "Supervisor",
      operator: "Operador",
      quality: "Qualidade",
      maintenance: "Manutenção",
    }
    return roles[role as keyof typeof roles] || role
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: "destructive" },
      supervisor: { variant: "default", className: "bg-blue-100 text-blue-800" },
      operator: { variant: "secondary" },
      quality: { variant: "secondary", className: "bg-green-100 text-green-800" },
      maintenance: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operator
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {getRoleLabel(role)}
      </Badge>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.name.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Email válido é obrigatório")
      return
    }

    setLoading(true)

    try {
      // Simular atualização do perfil
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Perfil atualizado com sucesso!")
      setEditing(false)
    } catch (error) {
      setError("Erro ao atualizar perfil. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!passwordData.currentPassword) {
      setError("Senha atual é obrigatória")
      return
    }

    if (!passwordData.newPassword) {
      setError("Nova senha é obrigatória")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Nova senha deve ter pelo menos 6 caracteres")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Senhas não coincidem")
      return
    }

    setLoading(true)

    try {
      // Simular alteração de senha
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Senha alterada com sucesso!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações do Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <Button variant="outline" onClick={() => setEditing(!editing)} disabled={loading}>
              {editing ? "Cancelar" : "Editar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Digite seu email"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome</Label>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Função</Label>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Membro desde</Label>
                  <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
              />
            </div>

            <Button type="submit" disabled={loading}>
              <Shield className="w-4 h-4 mr-2" />
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Login realizado</p>
                <p className="text-sm text-gray-500">Acesso ao sistema</p>
              </div>
              <p className="text-sm text-gray-500">Hoje, {new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Perfil visualizado</p>
                <p className="text-sm text-gray-500">Página de perfil acessada</p>
              </div>
              <p className="text-sm text-gray-500">Hoje, {new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
