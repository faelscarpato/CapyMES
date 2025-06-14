"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Wifi, WifiOff } from "lucide-react"
import { useConnection } from "@/lib/connection-context"
import { createUserWithPassword } from "@/lib/supabase"
import type { User } from "@/lib/types"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserAdded: (user: User) => void
}

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const { isOnline } = useConnection()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "operator" as const,
    password: "",
    confirmPassword: "",
  })

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password, confirmPassword: password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validações
    if (!formData.name.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Email deve ter um formato válido")
      return
    }

    if (!formData.password) {
      setError("Senha é obrigatória")
      return
    }

    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem")
      return
    }

    setLoading(true)

    try {
      console.log("🔄 Criando usuário...", { isOnline })

      // Criar usuário usando a nova API
      const result = await createUserWithPassword(
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
        },
        formData.password,
        isOnline,
      )

      if (result.success) {
        console.log("✅ Usuário criado com sucesso:", result.user)

        // Notificar o componente pai
        onUserAdded(result.user)

        // Mostrar mensagem de sucesso
        setSuccess(result.message)

        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "operator",
          password: "",
          confirmPassword: "",
        })

        // Mostrar credenciais para o administrador
        const credentialsMessage = `Usuário criado com sucesso!\n\n📧 Email: ${result.user.email}\n🔑 Senha: ${formData.password}\n\n${result.message}\n\nAnote essas credenciais para o usuário.`

        setTimeout(() => {
          alert(credentialsMessage)
          onOpenChange(false)
        }, 1000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      setError("Erro inesperado ao criar usuário. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Novo Usuário
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Status de Conexão */}
          <div
            className={`text-xs p-2 rounded ${isOnline ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
          >
            {isOnline ? (
              <span>✅ Usuário será salvo no Supabase (nuvem)</span>
            ) : (
              <span>⚠️ Usuário será salvo localmente (offline)</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Digite o email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função *</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="quality">Qual idade</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha *</Label>
              <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                Gerar Senha
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Digite a senha (min. 6 caracteres)"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirme a senha"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
