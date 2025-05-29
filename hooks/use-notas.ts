import { useAuth } from "@/contexts/auth-context"
import { supabaseClient } from "@/lib/supabase-client"
import { NotaFiscal } from "@/types/nota-fiscal"
import { useCallback, useEffect, useState } from "react"

export function useNotas() {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAuth()

  const fetchNotas = useCallback(async () => {
    setLoading(true)
    try {
      if (!session?.user) return

      const { data, error: supaError } = await supabaseClient
        .from("notas_fiscais")
        .select("*")
        .eq("user_id", session.user.id)
        .order("data_emissao", { ascending: false })

      if (supaError) throw supaError
 
      setNotas(data as NotaFiscal[] ?? [])
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`Erro ao carregar notas fiscais: ${errorMessage}`)
      setNotas([])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchNotas()

    const handleNotaCreated = () => {
      fetchNotas()
    }

    window.addEventListener("notaFiscalCreated", handleNotaCreated)
    return () => {
      window.removeEventListener("notaFiscalCreated", handleNotaCreated)
    }
  }, [fetchNotas])

  return { notas, loading, error, reloadNotas: fetchNotas }
}
