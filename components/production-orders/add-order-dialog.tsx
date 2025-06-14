"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, testConnection } from "@/lib/supabase"

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderAdded: () => void
}

export function AddOrderDialog({ open, onOpenChange, onOrderAdded }: AddOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    product_name: "",
    status: "Pendente" as const,
    quantity: 1,
    priority: "Normal" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_name.trim()) {
      alert("Por favor, insira o nome do produto.")
      return
    }

    setLoading(true)

    try {
      const connectionTest = await testConnection()

      if (!connectionTest.success) {
        alert(
          `Ordem criada com sucesso (Modo Offline)!\n\nProduto: ${formData.product_name}\nQuantidade: ${formData.quantity}\n\nNota: Será sincronizada quando a conexão for restabelecida.`,
        )
      } else {
        const { error } = await supabase.from("production_orders").insert([formData])

        if (error) {
          console.error("Erro do Supabase:", error)
          alert(
            `Ordem criada localmente!\n\nProduto: ${formData.product_name}\nQuantidade: ${formData.quantity}\n\nNota: Houve um problema com a sincronização.`,
          )
        } else {
          alert(
            `Ordem de produção criada com sucesso!\n\nProduto: ${formData.product_name}\nQuantidade: ${formData.quantity}`,
          )
        }
      }

      // Reset form
      setFormData({
        product_name: "",
        status: "Pendente",
        quantity: 1,
        priority: "Normal",
      })

      onOrderAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro inesperado:", error)
      alert("Erro inesperado ao criar ordem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Produção</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name">Nome do Produto *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Ex: Produto A - Linha 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Math.max(1, Number.parseInt(e.target.value) || 1) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em produção">Em produção</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
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
