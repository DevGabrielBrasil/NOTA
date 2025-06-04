"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!session.isLoading) {
      if (!session.user) {
        // Se não está logado e não está na página de login, redireciona para login
        if (pathname !== "/login") {
          router.push("/login")
        }
      }
      // Se quiser proteger rotas de admin, pode colocar a lógica aqui com requireAdmin
      // Por enquanto, não redirecione para /dashboard para evitar loop
    }
  }, [session, router, pathname])

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session.user) {
    // Não mostra nada enquanto redireciona para login
    return null
  }

  // Usuário está logado, mostra o conteúdo protegido
  return <>{children}</>
}
