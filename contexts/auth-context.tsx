"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

// Definimos um tipo mais específico para os metadados do usuário
interface UserMetadata {
  nome?: string;
  cnpj?: string;
}

// Estendemos o tipo User para incluir nossos metadados
interface CustomUser {
  id: string;
  email: string;
  name: string;
  cnpj: string;
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
  const { data: sessionData, status } = useSession()
  const [session, setSession] = useState<Session>({ user: null, isLoading: true })

  useEffect(() => {
    if (status === 'loading') {
      setSession({ user: null, isLoading: true })
    } else if (status === 'authenticated' && sessionData?.user) {
      const user: CustomUser = {
        id: (sessionData.user as any).id || sessionData.user.email!, // Fallback para email se não tiver ID
        email: sessionData.user.email!,
        name: sessionData.user.name!,
        cnpj: (sessionData.user as any).cnpj || '',
        user_metadata: {
          nome: sessionData.user.name!,
          cnpj: (sessionData.user as any).cnpj || ''
        }
      }
      setSession({ user, isLoading: false })
    } else {
      setSession({ user: null, isLoading: false })
    }
  }, [sessionData, status])

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      toast.error("Erro no login", { description: "Email ou palavra-passe inválidos." })
    } else {
      router.push("/dashboard")
    }
  }
  
  // ATUALIZADO: Função signUp agora usa nossa API local
  const signUp = async (dados: SignUpData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error("Erro ao criar conta", { description: data.error })
      } else {
        toast.success("Conta criada com sucesso! Faça login para continuar.")
        router.push("/login")
      }
    } catch (error) {
      toast.error("Erro ao criar conta", { description: "Erro de conexão" })
    }
  }

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false })
    router.push("/login")
  }

  return <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}
