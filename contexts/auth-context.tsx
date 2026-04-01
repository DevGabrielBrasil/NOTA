"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

interface CustomUser {
  id: string
  email: string
  name: string
  cnpj: string
}

interface Session {
  user: CustomUser | null
  isLoading: boolean
}

interface SignUpData {
  email: string
  password: string
  nome: string
  cnpj: string
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
  const { data: sessionData, isPending } = authClient.useSession()

  const session: Session = {
    user: sessionData?.user
      ? {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          cnpj: (sessionData.user as any).cnpj ?? "",
        }
      : null,
    isLoading: isPending,
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      toast.error("Erro no login", { description: "Email ou senha inválidos." })
    } else {
      router.push("/dashboard")
    }
  }

  const signUp = async ({ email, password, nome, cnpj }: SignUpData) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: nome,
      cnpj,
    } as any)

    if (error) {
      toast.error("Erro ao criar conta", { description: error.message })
    } else {
      toast.success("Conta criada com sucesso! Faça login para continuar.")
      router.push("/login")
    }
  }

  const signOut = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}
