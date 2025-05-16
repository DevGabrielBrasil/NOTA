"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!session.isLoading) {
      if (!session.user) {
        router.push("/login")
      } else {
        router.push("/dashboard")
      }
    }
  }, [session, router, requireAdmin])

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  return <>{children}</>
}
