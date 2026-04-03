"use client"

import { useState, useMemo, useEffect } from "react"
import { useNotas } from "@/hooks/use-notas"
import { CurrencyInput } from "@/components/currency-input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, TrendingUp, Calculator, ArrowRight, Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const LIMITE_MEI = 81000
const LIMITE_MEI_EXCESSO = 97200 // 20% acima do limite

// Valores mensais do DAS MEI (2024/2025 - aproximados)
const DAS_MEI: Record<string, number> = {
  comercio: 71.60,
  servico: 75.60,
  industria: 72.60,
  comercio_servico: 76.60,
}

// Tabela Simples Nacional - Anexo I (Comércio)
const ANEXO_I = [
  { ate: 180000, aliquota: 0.04, deducao: 0 },
  { ate: 360000, aliquota: 0.073, deducao: 5940 },
  { ate: 720000, aliquota: 0.095, deducao: 13860 },
  { ate: 1800000, aliquota: 0.107, deducao: 22500 },
  { ate: 3600000, aliquota: 0.143, deducao: 87300 },
  { ate: 4800000, aliquota: 0.19, deducao: 378000 },
]

// Tabela Simples Nacional - Anexo II (Indústria)
const ANEXO_II = [
  { ate: 180000, aliquota: 0.045, deducao: 0 },
  { ate: 360000, aliquota: 0.078, deducao: 5940 },
  { ate: 720000, aliquota: 0.10, deducao: 13860 },
  { ate: 1800000, aliquota: 0.112, deducao: 22500 },
  { ate: 3600000, aliquota: 0.147, deducao: 85500 },
  { ate: 4800000, aliquota: 0.30, deducao: 720000 },
]

// Tabela Simples Nacional - Anexo III (Serviços)
const ANEXO_III = [
  { ate: 180000, aliquota: 0.06, deducao: 0 },
  { ate: 360000, aliquota: 0.112, deducao: 9360 },
  { ate: 720000, aliquota: 0.135, deducao: 17640 },
  { ate: 1800000, aliquota: 0.16, deducao: 35640 },
  { ate: 3600000, aliquota: 0.21, deducao: 125640 },
  { ate: 4800000, aliquota: 0.33, deducao: 648000 },
]

type Atividade = "comercio" | "servico" | "industria" | "comercio_servico"

function getAnexo(atividade: Atividade) {
  if (atividade === "comercio" || atividade === "comercio_servico") return ANEXO_I
  if (atividade === "industria") return ANEXO_II
  return ANEXO_III
}

function calcularSimplesNacional(faturamento: number, atividade: Atividade): number {
  if (faturamento <= 0) return 0
  const anexo = getAnexo(atividade)

  for (const faixa of anexo) {
    if (faturamento <= faixa.ate) {
      const aliquotaEfetiva = ((faturamento * faixa.aliquota) - faixa.deducao) / faturamento
      return faturamento * Math.max(aliquotaEfetiva, 0)
    }
  }

  // Acima do limite do Simples
  const ultima = anexo[anexo.length - 1]
  const aliquotaEfetiva = ((faturamento * ultima.aliquota) - ultima.deducao) / faturamento
  return faturamento * Math.max(aliquotaEfetiva, 0)
}

function calcularDASAnual(atividade: Atividade): number {
  return DAS_MEI[atividade] * 12
}

function getAliquotaEfetiva(faturamento: number, atividade: Atividade): number {
  if (faturamento <= 0) return 0
  const anexo = getAnexo(atividade)

  for (const faixa of anexo) {
    if (faturamento <= faixa.ate) {
      return Math.max(((faturamento * faixa.aliquota) - faixa.deducao) / faturamento * 100, 0)
    }
  }
  return 0
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function SimuladorPage() {
  const { notas, loading } = useNotas()
  const [faturamentoProjetado, setFaturamentoProjetado] = useState(0)
  const [atividade, setAtividade] = useState<Atividade>("servico")

  // Calcular faturamento real do ano
  const faturamentoAtual = useMemo(() => {
    const anoAtual = new Date().getFullYear()
    return notas.reduce((acc, nota) => {
      const match = String(nota.data_fim).match(/(\d{4})/)
      if (match && parseInt(match[1]) === anoAtual) {
        return acc + (Number(nota.valor_total) || 0)
      }
      return acc
    }, 0)
  }, [notas])

  // Inicializar com faturamento projetado baseado na média
  useEffect(() => {
    if (!loading && faturamentoAtual > 0 && faturamentoProjetado === 0) {
      const mesAtual = new Date().getMonth() + 1
      const projecao = Math.round((faturamentoAtual / mesAtual) * 12)
      setFaturamentoProjetado(projecao)
    }
  }, [loading, faturamentoAtual])

  const valor = faturamentoProjetado > 0 ? faturamentoProjetado : faturamentoAtual

  const resultado = useMemo(() => {
    const dasAnual = calcularDASAnual(atividade)
    const impostoME = calcularSimplesNacional(valor, atividade)
    const aliquotaEfetiva = getAliquotaEfetiva(valor, atividade)
    const aliquotaMEI = valor > 0 ? (dasAnual / valor) * 100 : 0

    const excedeu = valor > LIMITE_MEI
    const excedeuMuito = valor > LIMITE_MEI_EXCESSO

    // Se excedeu até 20%: paga retroativo sobre o excedente
    // Se excedeu mais de 20%: desenquadra retroativamente desde janeiro
    let impostoDesenquadramento = 0
    if (excedeu && !excedeuMuito) {
      // Paga sobre o excedente com alíquota do Simples
      const excedente = valor - LIMITE_MEI
      impostoDesenquadramento = dasAnual + calcularSimplesNacional(excedente, atividade)
    } else if (excedeuMuito) {
      // Desenquadra retroativamente: paga Simples sobre TUDO
      impostoDesenquadramento = impostoME
    }

    const economia = excedeu ? 0 : impostoME - dasAnual

    return {
      dasAnual,
      impostoME,
      aliquotaEfetiva,
      aliquotaMEI,
      excedeu,
      excedeuMuito,
      impostoDesenquadramento,
      economia,
      diferenca: impostoME - dasAnual,
    }
  }, [valor, atividade])

  const dadosGrafico = [
    { nome: "MEI (DAS)", valor: resultado.excedeu ? resultado.impostoDesenquadramento : resultado.dasAnual },
    { nome: "ME (Simples)", valor: resultado.impostoME },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Simulador de Desenquadramento MEI</h2>
        <p className="text-sm text-muted-foreground">
          Simule quanto pagaria de imposto caso ultrapasse o limite de R$ 81.000 e precise migrar para ME.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Faturamento atual no ano</Label>
              <p className="text-2xl font-bold text-primary">{formatBRL(faturamentoAtual)}</p>
              <p className="text-xs text-muted-foreground">
                {((faturamentoAtual / LIMITE_MEI) * 100).toFixed(1)}% do limite MEI
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projecao">Faturamento anual projetado (R$)</Label>
              <CurrencyInput
                value={faturamentoProjetado}
                onChange={(v) => setFaturamentoProjetado(v)}
              />
              <p className="text-xs text-muted-foreground">
                Ajuste para simular diferentes cenários
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tipo de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Atividade principal</Label>
              <Select value={atividade} onValueChange={(v) => setAtividade(v as Atividade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Prestação de Serviços</SelectItem>
                  <SelectItem value="comercio">Comércio</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                  <SelectItem value="comercio_servico">Comércio e Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 text-sm">
              <p><strong>DAS mensal MEI:</strong> {formatBRL(DAS_MEI[atividade])}</p>
              <p><strong>DAS anual MEI:</strong> {formatBRL(resultado.dasAnual)}</p>
              <p><strong>Anexo Simples:</strong> {atividade === "servico" ? "III" : atividade === "industria" ? "II" : "I"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {valor > LIMITE_MEI && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {resultado.excedeuMuito
              ? "Desenquadramento retroativo!"
              : "Limite MEI ultrapassado!"}
          </AlertTitle>
          <AlertDescription>
            {resultado.excedeuMuito ? (
              <>
                Com faturamento de {formatBRL(valor)}, você excede em mais de 20% o limite do MEI (R$ 97.200).
                Neste caso, o <strong>desenquadramento é retroativo a janeiro</strong> e todo o faturamento do ano
                será tributado pelo Simples Nacional.
              </>
            ) : (
              <>
                Com faturamento de {formatBRL(valor)}, você excede o limite de R$ 81.000 mas
                fica abaixo de R$ 97.200 (20% de excesso). Você pagará o <strong>DAS normalmente até
                o limite + imposto sobre o excedente</strong> ({formatBRL(valor - LIMITE_MEI)}).
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {valor > 0 && valor <= LIMITE_MEI && resultado.economia > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Você economiza como MEI!</AlertTitle>
          <AlertDescription>
            Mantendo o faturamento de {formatBRL(valor)}, você economiza{" "}
            <strong>{formatBRL(resultado.economia)}</strong> por ano em relação ao Simples Nacional.
          </AlertDescription>
        </Alert>
      )}

      {/* Comparativo */}
      {valor > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={valor <= LIMITE_MEI ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}>
            <CardHeader className="pb-2">
              <CardDescription>Como MEI</CardDescription>
              <CardTitle className="text-2xl">
                {formatBRL(resultado.excedeu ? resultado.impostoDesenquadramento : resultado.dasAnual)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {resultado.excedeu
                  ? resultado.excedeuMuito
                    ? "Simples Nacional retroativo (desenquadrado)"
                    : `DAS anual + imposto sobre excedente`
                  : `DAS fixo de ${formatBRL(DAS_MEI[atividade])}/mês`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aliquota efetiva: {resultado.excedeu ? resultado.aliquotaEfetiva.toFixed(2) : resultado.aliquotaMEI.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="flex items-center justify-center">
            <CardContent className="py-6 text-center">
              <ArrowRight className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {resultado.diferenca > 0 ? "Diferença" : "Economia ME"}
              </p>
              <p className={`text-xl font-bold ${resultado.diferenca > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {resultado.diferenca > 0 ? "+" : ""}{formatBRL(resultado.diferenca)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">por ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Como ME (Simples Nacional)</CardDescription>
              <CardTitle className="text-2xl">{formatBRL(resultado.impostoME)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Anexo {atividade === "servico" ? "III" : atividade === "industria" ? "II" : "I"} do Simples Nacional
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aliquota efetiva: {resultado.aliquotaEfetiva.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico */}
      {valor > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comparativo de Impostos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  width={60}
                />
                <Tooltip formatter={(value: number) => [formatBRL(value), "Imposto"]} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Como funciona o desenquadramento?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Faturou até R$ 81.000</p>
            <p>Continua como MEI normalmente, pagando apenas o DAS fixo mensal.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Faturou entre R$ 81.000 e R$ 97.200 (até 20% de excesso)</p>
            <p>Paga o DAS normalmente durante o ano. Em janeiro do ano seguinte, migra para ME e paga uma guia complementar sobre o valor que excedeu, com a aliquota do Simples Nacional.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Faturou acima de R$ 97.200 (mais de 20% de excesso)</p>
            <p>O desenquadramento é retroativo a janeiro do ano em curso. Todo o faturamento do ano será tributado pelo Simples Nacional, e o MEI precisará regularizar a diferença de impostos.</p>
          </div>
          <p className="text-xs mt-2 border-t pt-2">
            Valores do DAS e aliquotas baseados nas tabelas vigentes. Consulte um contador para orientação personalizada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
