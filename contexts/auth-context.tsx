"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabaseClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

// Definimos um tipo mais específico para os metadados do usuário
interface UserMetadata {
  nome?: string;
  cnpj?: string;
}

// Estendemos o tipo User para incluir nossos metadados
interface CustomUser extends User {
  user_metadata: UserMetadata;
}

interface Session {
  user: CustomUser | null;
  isLoading: boolean;
}

// Atualizamos a interface para o signUp para incluir o CNPJ
interface SignUpData {
  email: string;
  password: string;
  nome: string;
  cnpj: string;
}

interface AuthContextType {
  session: Session
  signIn: (email: string, password: string) => Promise<void>
  signUp: (dados: SignUpData) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session>({ user: null, isLoading: true })

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      setSession({ user: (session?.user as CustomUser) ?? null, isLoading: false })
    }
    getSession()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession({ user: (session?.user as CustomUser) ?? null, isLoading: false })
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error("Erro no login", { description: "Email ou palavra-passe inválidos." })
    } else {
      router.push("/dashboard")
    }
  }
  
  // ATUALIZADO: Função signUp agora salva o CNPJ nos metadados
  const signUp = async (dados: SignUpData) => {
    const { error } = await supabaseClient.auth.signUp({
      email: dados.email,
      password: dados.password,
      options: { 
        data: { 
          nome: dados.nome,
          cnpj: dados.cnpj // Adicionamos o CNPJ aqui
        } 
      }
    })
    if (error) {
      toast.error("Erro ao criar conta", { description: error.message })
    } else {
      toast.info("Verifique o seu e-mail para confirmar a conta.")
      router.push("/login")
    }
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    router.push("/login")
  }

  return <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}
