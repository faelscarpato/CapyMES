"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem("capymes_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Credenciais do administrador
      if (email === "admin" && password === "admin") {
        const adminUser: User = {
          id: "admin-001",
          name: "Administrador",
          email: "admin@capymes.com",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setUser(adminUser)
        setIsAuthenticated(true)
        localStorage.setItem("capymes_user", JSON.stringify(adminUser))
        return true
      }

      // Usuários de demonstração expandidos
      const mockUsers: User[] = [
        {
          id: "user-001",
          name: "João Silva",
          email: "joao@capymes.com",
          role: "supervisor",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-002",
          name: "Maria Santos",
          email: "maria@capymes.com",
          role: "operator",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-003",
          name: "Pedro Costa",
          email: "pedro@capymes.com",
          role: "operator",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-004",
          name: "Ana Oliveira",
          email: "ana@capymes.com",
          role: "quality",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-005",
          name: "Carlos Ferreira",
          email: "carlos@capymes.com",
          role: "maintenance",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Verificar usuários salvos localmente
      const savedUsers = localStorage.getItem("capymes_users")
      const localUsers = savedUsers ? JSON.parse(savedUsers) : []
      const allUsers = [...mockUsers, ...localUsers]

      // Verificar credenciais
      const foundUser = allUsers.find((u) => u.email === email)
      if (foundUser) {
        // Verificar senha salva ou senha padrão
        const savedPasswords = JSON.parse(localStorage.getItem("capymes_passwords") || "{}")
        const userPassword = savedPasswords[email] || "123456" // senha padrão

        if (password === userPassword) {
          setUser(foundUser)
          setIsAuthenticated(true)
          localStorage.setItem("capymes_user", JSON.stringify(foundUser))
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("capymes_user")
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
