"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, Settings, Users, Shield, Edit, Trash2 } from "lucide-react"
import { AddUserDialog } from "@/components/admin/add-user-dialog"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import type { User } from "@/lib/types"

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
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
  }, [isAdmin, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Simular busca de usuários
      const mockUsers: User[] = [
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

      // Recuperar usuários salvos localmente
      const savedUsers = localStorage.getItem("capymes_users")
      if (savedUsers) {
        const localUsers = JSON.parse(savedUsers)
        setUsers([...mockUsers, ...localUsers])
      } else {
        setUsers(mockUsers)
        localStorage.setItem("capymes_users", JSON.stringify([]))
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAdded = (newUser: User) => {
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)

    // Salvar usuários adicionados localmente
    const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
    localStorage.setItem("capymes_users", JSON.stringify(addedUsers))
  }

  const handleUserUpdated = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    setUsers(updatedUsers)

    // Atualizar localStorage
    const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
    localStorage.setItem("capymes_users", JSON.stringify(addedUsers))
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert("Você não pode excluir seu próprio usuário!")
      return
    }

    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsers = users.filter((u) => u.id !== userId)
      setUsers(updatedUsers)

      // Atualizar localStorage
      const addedUsers = updatedUsers.filter((u) => !u.id.startsWith("admin-") && !u.id.startsWith("user-"))
      localStorage.setItem("capymes_users", JSON.stringify(addedUsers))
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
          <p className="text-muted-foreground">Gerenciamento de usuários e configurações avançadas</p>
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
