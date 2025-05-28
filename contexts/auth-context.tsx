"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User, Session } from "@/types/auth"

interface AuthContextType {
  session: Session
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nome: string, cnpj: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
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
        } = await supabaseClient.auth.getSession()

        if (error) throw error

        if (supabaseSession) {
          const { data: userData, error: userError } = await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("user_id", supabaseSession.user.id)
            .single()

          if (userError) console.error("Erro ao buscar dados do usuário:", userError)

          const user: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || "",
            nome: userData?.nome || "",
            cpnj: userData?.cpnj || "", // Mantido para retrocompatibilidade com o typo
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

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
    const userId = session.user.id

    // Obter os dados do usuário com join
    const { data: userData, error: userError } = await supabaseClient
    .from("usuarios")
    .select("*")
      .eq("user_id", userId)
      .single()

    if (userError) console.error("Erro ao buscar dados do usuário:", userError)

    const user: User = {
      id: session.user.id,
      email: session.user.email || "",
      nome: userData?.nome || "",
      cpnj: userData?.cpnj || "",
      created_at: userData?.created_at || new Date().toISOString(),
    }

    setSession({ user, isLoading: false, error: null })
  }
})

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

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

  const signUp = async (email: string, password: string, nome: string, cnpj: string) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }))

      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            cnpj,
          },
        },
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Erro ao criar usuário")
      }

      // Se a confirmação de e-mail estiver habilitada, o usuário não estará logado aqui
      await supabaseClient.auth.signOut()

      toast({
        title: "Verifique seu e-mail",
        description: "Enviamos um link de confirmação. Confirme para ativar sua conta.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      setSession((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSession((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut()
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
