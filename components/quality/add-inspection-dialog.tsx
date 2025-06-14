"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { qualityAPI, productionOrdersAPI, usersAPI, type ProductionOrder, type User } from "@/lib/supabase"

interface AddInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInspectionAdded: () => void
}

export function AddInspectionDialog({ open, onOpenChange, onInspectionAdded }: AddInspectionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    inspection_number: "",
    production_order_id: "",
    inspector_id: "",
    inspection_type: "",
    sample_size: 1,
    defects_found: 0,
    observations: "",
  })

  useEffect(() => {
    if (open) {
      loadData()
      generateInspectionNumber()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [ordersData, usersData] = await Promise.all([productionOrdersAPI.getAll(), usersAPI.getAll()])

      setProductionOrders(ordersData.filter((order) => order.status !== "Cancelada"))
      setUsers(usersData.filter((user) => user.role === "quality" || user.role === "supervisor"))
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const generateInspectionNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const time = String(now.getTime()).slice(-4)

    setFormData((prev) => ({
      ...prev,
      inspection_number: `QI-${year}${month}${day}-${time}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.inspection_number || !formData.inspection_type) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)

    try {
      const conformityRate = ((formData.sample_size - formData.defects_found) / formData.sample_size) * 100

      await qualityAPI.create({
        ...formData,
        conformity_rate: Math.round(conformityRate * 100) / 100,
        status: "pending",
        inspection_date: new Date().toISOString(),
      } as any)

      alert("Inspeção criada com sucesso!")

      setFormData({
        inspection_number: "",
        production_order_id: "",
        inspector_id: "",
        inspection_type: "",
        sample_size: 1,
        defects_found: 0,
        observations: "",
      })

      onInspectionAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar inspeção:", error)
      alert("Erro ao criar inspeção. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Inspeção de Qualidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inspection_number">Número da Inspeção *</Label>
            <Input
              id="inspection_number"
              value={formData.inspection_number}
              onChange={(e) => setFormData({ ...formData, inspection_number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspection_type">Tipo de Inspeção *</Label>
            <Select
              value={formData.inspection_type}
              onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inspeção Visual">Inspeção Visual</SelectItem>
                <SelectItem value="Teste Funcional">Teste Funcional</SelectItem>
                <SelectItem value="Inspeção Dimensional">Inspeção Dimensional</SelectItem>
                <SelectItem value="Teste de Resistência">Teste de Resistência</SelectItem>
                <SelectItem value="Controle de Qualidade Final">Controle de Qualidade Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="production_order_id">Ordem de Produção</Label>
            <Select
              value={formData.production_order_id}
              onValueChange={(value) => setFormData({ ...formData, production_order_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ordem" />
              </SelectTrigger>
              <SelectContent>
                {productionOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.order_number} - {order.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspector_id">Inspetor</Label>
            <Select
              value={formData.inspector_id}
              onValueChange={(value) => setFormData({ ...formData, inspector_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o inspetor" />
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
              <Label htmlFor="sample_size">Tamanho da Amostra *</Label>
              <Input
                id="sample_size"
                type="number"
                min="1"
                value={formData.sample_size}
                onChange={(e) => setFormData({ ...formData, sample_size: Number.parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defects_found">Defeitos Encontrados</Label>
              <Input
                id="defects_found"
                type="number"
                min="0"
                max={formData.sample_size}
                value={formData.defects_found}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defects_found: Math.min(Number.parseInt(e.target.value) || 0, formData.sample_size),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações sobre a inspeção..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Inspeção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
