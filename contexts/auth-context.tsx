"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User, Session } from "@/types/auth"

interface AuthContextType {
  session: Session
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nome: string, empresa: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session>({
    user: null,
    isLoading: true,
    error: null,
  })
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session: supabaseSession },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        if (supabaseSession) {
          const { data: userData, error: userError } = await supabase
            .from("auth.users")
            .select("*")
            .eq("id", supabaseSession.user.id)
            .single()

          if (userError) console.error("Erro ao buscar dados do usuário:", userError)

          const user: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || "",
            nome: userData?.nome || "",
            empresa: userData?.empresa || "",
            role: userData?.role || "user",
            created_at: userData?.created_at || new Date().toISOString(),
          }

          setSession({ user, isLoading: false, error: null })
        } else {
          setSession({ user: null, isLoading: false, error: null })
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        setSession({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        const { data: userData, error: userError } = await supabase
          .from("auth.users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError) console.error("Erro ao buscar dados do usuário:", userError)

        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          nome: userData?.nome || "",
          empresa: userData?.empresa || "",
          role: userData?.role || "user",
          created_at: userData?.created_at || new Date().toISOString(),
        }

        setSession({ user, isLoading: false, error: null })
      } else if (event === "SIGNED_OUT") {
        setSession({ user: null, isLoading: false, error: null })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      toast({ title: "Login realizado com sucesso!", description: "Bem-vindo de volta ao sistema." })
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setSession((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      }))
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      })
    }
  }

  const signUp = async (email: string, password: string, nome: string, empresa: string) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }))
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

      if (authError || !authData.user) throw new Error(authError?.message || "Erro ao criar usuário")

      try {
        await supabase.rpc("exec", { query: "SELECT 1" })
      } catch (error) {
        toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      })
        return
      }

      toast({ title: "Registro realizado com sucesso!", description: "Sua conta foi criada. Você já pode acessar o sistema." })
      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      setSession((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      toast({ title: "Erro ao criar conta", description: errorMessage, variant: "destructive" })
    } finally {
      setSession((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      toast({ title: "Logout realizado", description: "Você saiu do sistema com sucesso." })
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  return <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}
