"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2, AlertTriangle } from "lucide-react"
import { getFaturamentoMensal } from "@/actions/faturamento-actions"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/contexts/app-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FaturamentoMensal {
  mes: string
  valor: number
}

export function FaturamentoChart() {
  const { dataVersion } = useAppContext()
  const [data, setData] = useState<FaturamentoMensal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabelaNaoExiste, setTabelaNaoExiste] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const faturamento = await getFaturamentoMensal()
      setData(faturamento)
      setError(null)

      // Verificar se todos os valores são zero (possível indicação de que a tabela não existe)
      const todosSaoZero = faturamento.every((item) => item.valor === 0)
      setTabelaNaoExiste(todosSaoZero)
    } catch (error) {
      console.error("Erro ao buscar dados de faturamento:", error)
      setError("Não foi possível carregar os dados de faturamento. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dataVersion])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchData()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (tabelaNaoExiste) {
    return (
      <div className="py-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tabela não encontrada</AlertTitle>
          <AlertDescription>
            Não foi possível encontrar dados de faturamento. Verifique se a tabela de notas fiscais foi criada e se
            existem notas cadastradas.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="valor" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis tickFormatter={(value) => `R$ ${value}`} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Bar dataKey="valor" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
