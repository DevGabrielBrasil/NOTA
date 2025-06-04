"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, Database } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

// Limite de faturamento anual do MEI
const LIMITE_FATURAMENTO_MEI = 81000

export function ResumoFaturamento() {
  const { session } = useAuth()
  const router = useRouter()
  const [totalFaturado, setTotalFaturado] = useState<number>(0)
  const [percentualUtilizado, setPercentualUtilizado] = useState<number>(0)
  const [valorRestante, setValorRestante] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const calcularFaturamento = async () => {
    try {
      if (!session?.user) {
        setTotalFaturado(0)
        setPercentualUtilizado(0)
        setValorRestante(LIMITE_FATURAMENTO_MEI)
        setIsLoading(false)
        return
      }

      // Obter o ano atual
      const anoAtual = new Date().getFullYear()
      const inicioAno = `${anoAtual}-01-01`
      const fimAno = `${anoAtual}-12-31`

      // Buscar notas fiscais do ano atual
      const { data, error } = await supabaseClient
        .from("notas_fiscais")
        .select("valor_total")
        .eq("user_id", session.user.id)
        .gte("data_emissao", inicioAno)
        .lte("data_emissao", fimAno)

      if (error) {
        // Se o erro for porque a tabela não existe, atualizar o estado
        if (
          error.message.includes("does not exist") ||
          error.message.includes("relation") ||
          error.message.includes("não existe")
        ) {
          setTotalFaturado(0)
          setPercentualUtilizado(0)
          setValorRestante(LIMITE_FATURAMENTO_MEI)
        } else {
          throw error
        }
      } else {
        // Calcular o total faturado
        const total = data ? data.reduce((acc, nota) => acc + (nota.valor_total || 0), 0) : 0

        // Calcular o percentual utilizado
        const percentual = (total / LIMITE_FATURAMENTO_MEI) * 100

        // Calcular o valor restante
        const restante = LIMITE_FATURAMENTO_MEI - total

        setTotalFaturado(total)
        setPercentualUtilizado(percentual)
        setValorRestante(restante)
      }
    } catch (error) {
      console.error("Erro ao calcular faturamento:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`Erro ao calcular faturamento: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }
calcularFaturamento()
  // Atualizar quando uma nota for criada ou excluída
  useEffect(() => {
    const handleNotaChanged = () => {
      // Só recalcular se a tabela existir
      
        calcularFaturamento()
      
    }

    window.addEventListener("notaFiscalCreated", handleNotaChanged)
    window.addEventListener("notaFiscalDeleted", handleNotaChanged)

    return () => {
      window.removeEventListener("notaFiscalCreated", handleNotaChanged)
      window.removeEventListener("notaFiscalDeleted", handleNotaChanged)
    }
  }, [])

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Determinar a cor da barra de progresso com base no percentual utilizado
  const getProgressColor = (): string => {
    if (percentualUtilizado >= 90) return "bg-red-500"
    if (percentualUtilizado >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleSetupDatabase = () => {
    router.push("/setup")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumo do Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumo do Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao calcular faturamento</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => calcularFaturamento()}>
                  Tentar novamente
                </Button>
                <Button variant="outline" size="sm" onClick={handleSetupDatabase}>
                  Verificar configuração
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Resumo do Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Faturado</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalFaturado)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Limite MEI</h3>
              <p className="text-2xl font-bold">{formatCurrency(LIMITE_FATURAMENTO_MEI)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Valor Restante</h3>
              <p className="text-2xl font-bold">{formatCurrency(valorRestante)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilização do Limite ({percentualUtilizado.toFixed(2)}%)</span>
              <span className="text-sm font-medium">
                {formatCurrency(totalFaturado)} / {formatCurrency(LIMITE_FATURAMENTO_MEI)}
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${getProgressColor()}`}
                style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
              />
            </div>
            <p className="text-sm mt-1">
              {percentualUtilizado >= 90
                ? "⚠️ ATENÇÃO: Você está próximo do limite de faturamento do MEI!"
                : percentualUtilizado >= 70
                  ? "⚠️ Atenção: Você já utilizou mais de 70% do limite de faturamento."
                  : "✅ Você está dentro do limite seguro de faturamento."}
            </p>
          </div> 
        </div>
      </CardContent>
    </Card>
  )
}
