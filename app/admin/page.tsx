"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useConnection } from "@/lib/connection-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, Settings, Users, Shield, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
import { AddUserDialog } from "@/components/admin/add-user-dialog"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import { usersAPI } from "@/lib/supabase"
import type { User } from "@/lib/types"

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const { isOnline } = useConnection()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    fetchUsers()
  }, [isAdmin, router, isOnline])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log("🔄 Buscando usuários...", { isOnline })

      // Buscar usuários usando a API
      const allUsers = await usersAPI.getAll(isOnline)
      console.log("📋 Usuários encontrados:", allUsers)

      // Adicionar usuários salvos localmente pelo admin
      const savedUsers = localStorage.getItem("capymes_users")
      if (savedUsers) {
        const localUsers = JSON.parse(savedUsers)
        const combinedUsers = [...allUsers, ...localUsers]

        // Remover duplicatas baseado no email
        const uniqueUsers = combinedUsers.filter(
          (user, index, self) => index === self.findIndex((u) => u.email === user.email),
        )

        setUsers(uniqueUsers)
      } else {
        setUsers(allUsers)
        localStorage.setItem("capymes_users", JSON.stringify([]))
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAdded = async (newUser: User) => {
    console.log("➕ Novo usuário adicionado:", newUser)

    // Atualizar a lista local
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)

    // Salvar usuários adicionados localmente como backup
    const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
    localStorage.setItem("capymes_users", JSON.stringify(addedUsers))

    // Mostrar mensagem de sucesso
    const statusMessage = isOnline ? "Usuário salvo no Supabase!" : "Usuário salvo localmente!"
    console.log("✅", statusMessage)
  }

  const handleUserUpdated = async (updatedUser: User) => {
    console.log("✏️ Usuário atualizado:", updatedUser)

    try {
      // Atualizar no Supabase se estiver online
      if (isOnline) {
        await usersAPI.update(updatedUser.id, updatedUser, isOnline)
      }

      // Atualizar a lista local
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      setUsers(updatedUsers)

      // Atualizar localStorage
      const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
      localStorage.setItem("capymes_users", JSON.stringify(addedUsers))
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("Você não pode excluir seu próprio usuário!")
      return
    }

    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        // Deletar do Supabase se estiver online
        if (isOnline) {
          await usersAPI.delete(userId, isOnline)
        }

        // Atualizar a lista local
        const updatedUsers = users.filter((u) => u.id !== userId)
        setUsers(updatedUsers)

        // Atualizar localStorage
        const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
        localStorage.setItem("capymes_users", JSON.stringify(addedUsers))

        // Remover senha do localStorage
        const userPasswords = JSON.parse(localStorage.getItem("capymes_passwords") || "{}")
        const userToDelete = users.find((u) => u.id === userId)
        if (userToDelete) {
          delete userPasswords[userToDelete.email]
          localStorage.setItem("capymes_passwords", JSON.stringify(userPasswords))
        }
      } catch (error) {
        console.error("Erro ao deletar usuário:", error)
        alert("Erro ao deletar usuário. Tente novamente.")
      }
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrador", variant: "destructive" },
      supervisor: { label: "Supervisor", variant: "default", className: "bg-blue-100 text-blue-800" },
      operator: { label: "Operador", variant: "secondary" },
      quality: { label: "Qualidade", variant: "secondary", className: "bg-green-100 text-green-800" },
      maintenance: { label: "Manutenção", variant: "secondary", className: "bg-orange-100 text-orange-800" },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operator
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getStats = () => {
    const total = users.length
    const byRole = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, byRole }
  }

  if (!isAdmin) {
    return null
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Gerenciamento de usuários e configurações avançadas</span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Status de Conexão */}
      {isOnline && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Conectado ao Supabase - Usuários serão salvos na nuvem</span>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Modo offline - Usuários serão salvos localmente</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byRole.admin || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisores</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byRole.supervisor || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários supervisor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadores</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byRole.operator || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários operador</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.id !== "admin-001" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} onUserAdded={handleUserAdded} />

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}
