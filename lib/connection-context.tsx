"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { testConnection as testSupabaseConnection } from "./supabase"

interface ConnectionContextType {
  isOnline: boolean
  isConnecting: boolean
  lastConnectionAttempt: Date | null
  connectionError: string | null
  attemptConnection: () => Promise<void>
  forceOffline: () => void
  connectionMode: "auto" | "manual"
  setConnectionMode: (mode: "auto" | "manual") => void
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined)

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<Date | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [connectionMode, setConnectionMode] = useState<"auto" | "manual">("manual")

  const attemptConnection = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    setLastConnectionAttempt(new Date())

    try {
      console.log("🔄 Tentando conectar ao Supabase...")

      // Verificar se há conexão com a internet primeiro
      if (!navigator.onLine) {
        throw new Error("Sem conexão com a internet")
      }

      const result = await testSupabaseConnection()

      if (result.success) {
        setIsOnline(true)
        setConnectionError(null)
        console.log("✅ Conectado ao Supabase com sucesso!")
      } else {
        setIsOnline(false)
        setConnectionError(result.message || "Falha na conexão")
        console.log("❌ Falha na conexão:", result.message)
      }
    } catch (error) {
      setIsOnline(false)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setConnectionError(errorMessage)
      console.log("❌ Erro na conexão:", errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const forceOffline = () => {
    setIsOnline(false)
    setConnectionError("Modo offline forçado pelo usuário")
    setConnectionMode("manual")
  }

  // Verificar conexão automaticamente apenas se estiver no modo auto
  useEffect(() => {
    if (connectionMode === "auto") {
      attemptConnection()

      // Verificar conexão a cada 30 segundos no modo auto
      const interval = setInterval(attemptConnection, 30000)
      return () => clearInterval(interval)
    }
  }, [connectionMode])

  // Escutar mudanças na conectividade da internet
  useEffect(() => {
    const handleOnline = () => {
      if (connectionMode === "auto") {
        attemptConnection()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionError("Sem conexão com a internet")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [connectionMode])

  return (
    <ConnectionContext.Provider
      value={{
        isOnline,
        isConnecting,
        lastConnectionAttempt,
        connectionError,
        attemptConnection,
        forceOffline,
        connectionMode,
        setConnectionMode,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  const context = useContext(ConnectionContext)
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider")
  }
  return context
}
