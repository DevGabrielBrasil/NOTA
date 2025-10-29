import { useAuth } from "@/contexts/auth-context"
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

      const response = await fetch('/api/notas')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar notas')
      }
 
      setNotas(data.data ?? [])
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
