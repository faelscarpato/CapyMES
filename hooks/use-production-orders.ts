"use client"

import { useState, useEffect, useCallback } from "react"
import { productionOrdersAPI, type ProductionOrder } from "@/lib/supabase"
import { useConnection } from "@/lib/connection-context"

export function useProductionOrders() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { isOnline } = useConnection()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await productionOrdersAPI.getAll(isOnline)
      setOrders(data)
    } catch (error) {
      console.error("Erro ao buscar ordens:", error)
    } finally {
      setLoading(false)
    }
  }, [isOnline])

  const addOrder = useCallback(
    async (orderData: Omit<ProductionOrder, "id" | "created_at" | "updated_at">) => {
      try {
        const newOrder = await productionOrdersAPI.create(orderData, isOnline)
        setOrders((prev) => [newOrder, ...prev])
        return { success: true, offline: !isOnline }
      } catch (error) {
        console.error("Erro ao adicionar ordem:", error)
        return { success: false, offline: !isOnline }
      }
    },
    [isOnline],
  )

  // Carregar dados iniciais
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Recarregar quando o status de conexão mudar
  useEffect(() => {
    if (isOnline) {
      fetchOrders()
    }
  }, [isOnline, fetchOrders])

  return {
    orders,
    loading,
    isOnline,
    fetchOrders,
    addOrder,
  }
}
