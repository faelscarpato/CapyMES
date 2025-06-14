"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (adminOnly && !isAdmin) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isAdmin, adminOnly, router])

  if (!isAuthenticated) {
    return null
  }

  if (adminOnly && !isAdmin) {
    return null
  }

  return <>{children}</>
}
