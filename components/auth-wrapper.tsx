"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { CapyAIButton } from "@/components/capy-ai-button"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Páginas que não precisam de autenticação
  const publicPages = ["/login"]
  const isPublicPage = publicPages.includes(pathname)

  // Se não está autenticado e não é uma página pública, mostrar apenas o conteúdo (será redirecionado)
  if (!isAuthenticated && !isPublicPage) {
    return <>{children}</>
  }

  // Se é página pública, mostrar sem layout
  if (isPublicPage) {
    return <>{children}</>
  }

  // Se está autenticado, mostrar com layout completo
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <CapyAIButton />
    </SidebarProvider>
  )
}
