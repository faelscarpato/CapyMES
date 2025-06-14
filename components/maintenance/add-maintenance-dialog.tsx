"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { maintenanceAPI, equipmentAPI, usersAPI, type Equipment, type User } from "@/lib/supabase"

interface AddMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderAdded: () => void
}

export function AddMaintenanceDialog({ open, onOpenChange, onOrderAdded }: AddMaintenanceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    order_number: "",
    equipment_id: "",
    type: "preventive" as const,
    priority: "Normal" as const,
    description: "",
    assigned_to: "",
    scheduled_date: "",
    estimated_hours: 0,
  })

  useEffect(() => {
    if (open) {
      loadData()
      generateOrderNumber()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [equipmentData, usersData] = await Promise.all([equipmentAPI.getAll(), usersAPI.getAll()])

      setEquipment(equipmentData)
      setUsers(usersData.filter((user) => user.role === "maintenance" || user.role === "supervisor"))
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const generateOrderNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const time = String(now.getTime()).slice(-4)

    setFormData((prev) => ({
      ...prev,
      order_number: `MO-${year}${month}${day}-${time}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.order_number || !formData.description) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)

    try {
      await maintenanceAPI.create({
        ...formData,
        status: "open",
        scheduled_date: formData.scheduled_date || null,
        created_by: users[0]?.id, // Usar primeiro usuário como criador (em produção seria o usuário logado)
      } as any)

      alert("Ordem de manutenção criada com sucesso!")

      setFormData({
        order_number: "",
        equipment_id: "",
        type: "preventive",
        priority: "Normal",
        description: "",
        assigned_to: "",
        scheduled_date: "",
        estimated_hours: 0,
      })

      onOrderAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar ordem de manutenção:", error)
      alert("Erro ao criar ordem de manutenção. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Manutenção</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order_number">Número da Ordem *</Label>
            <Input
              id="order_number"
              value={formData.order_number}
              onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_id">Equipamento</Label>
            <Select
              value={formData.equipment_id}
              onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name} ({eq.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                  <SelectItem value="predictive">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o trabalho de manutenção..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Responsável</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Data Agendada</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Horas Estimadas</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Ordem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
