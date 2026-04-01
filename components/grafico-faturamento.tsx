"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotas } from "@/hooks/use-notas"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

export function GraficoFaturamento() {
  const { notas, loading } = useNotas()

  const dados = useMemo(() => {
    const anoAtual = new Date().getFullYear()

    // Inicializa todos os meses com 0
    const porMes = MESES.map((mes, i) => ({
      mes,
      total: 0,
      index: i,
    }))

    // Soma o valor_total de cada nota no mês correspondente
    for (const nota of notas) {
      const match = String(nota.data_fim).match(/(\d{4})-(\d{2})/)
      if (match && parseInt(match[1]) === anoAtual) {
        const mes = parseInt(match[2]) - 1
        porMes[mes].total += Number(nota.valor_total) || 0
      }
    }

    return porMes
  }, [notas])

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Faturamento Mensal</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Faturamento Mensal - {new Date().getFullYear()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={55}
            />
            <Tooltip
              formatter={(value: number) => [formatBRL(value), "Faturado"]}
              labelFormatter={(label) => `${label}/${new Date().getFullYear()}`}
            />
            <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
