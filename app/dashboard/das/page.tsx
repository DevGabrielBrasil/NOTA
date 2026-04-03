"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/currency-input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Plus,
  Receipt,
  CalendarDays,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

// Valores DAS MEI 2025/2026 (aproximados)
const VALOR_DAS_PADRAO = 75.60

interface PagamentoDAS {
  id: number
  mes: number
  ano: number
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  pago: boolean
  observacao: string | null
}

function getStatusDAS(das: PagamentoDAS): { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: typeof CheckCircle2 } {
  if (das.pago) return { label: "Pago", variant: "default", icon: CheckCircle2 }

  const hoje = new Date()
  const vencimento = new Date(das.data_vencimento + "T12:00:00")
  const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDias < 0) return { label: `Vencido há ${Math.abs(diffDias)} dias`, variant: "destructive", icon: XCircle }
  if (diffDias <= 5) return { label: `Vence em ${diffDias} dias`, variant: "secondary", icon: AlertTriangle }
  return { label: "Em aberto", variant: "outline", icon: Clock }
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const formatData = (d: string) => {
  const match = d.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return d
  return `${match[3]}/${match[2]}/${match[1]}`
}

export default function DASPage() {
  const { session } = useAuth()
  const [pagamentos, setPagamentos] = useState<PagamentoDAS[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [dasParaPagar, setDasParaPagar] = useState<PagamentoDAS | null>(null)
  const [dataPagamento, setDataPagamento] = useState("")
  const [saving, setSaving] = useState(false)

  // Form de gerar parcelas
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear().toString())
  const [valorDas, setValorDas] = useState(VALOR_DAS_PADRAO)
  const [gerando, setGerando] = useState(false)

  const fetchPagamentos = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch("/api/das")
      const data = await res.json()
      if (res.ok) {
        setPagamentos(data.data || [])
      }
    } catch {
      toast.error("Erro ao carregar pagamentos DAS.")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchPagamentos()
  }, [fetchPagamentos])

  const gerarParcelas = async () => {
    const ano = parseInt(anoGerar)
    if (!ano || ano < 2020 || ano > 2030) {
      toast.warning("Informe um ano válido.")
      return
    }

    setGerando(true)
    try {
      for (let mes = 1; mes <= 12; mes++) {
        // Vencimento padrão: dia 20 do mês seguinte
        let mesPgto = mes + 1
        let anoPgto = ano
        if (mesPgto > 12) {
          mesPgto = 1
          anoPgto = ano + 1
        }
        const dataVencimento = `${anoPgto}-${String(mesPgto).padStart(2, "0")}-20`

        await fetch("/api/das", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mes,
            ano,
            valor: valorDas,
            data_vencimento: dataVencimento,
            pago: false,
          }),
        })
      }

      toast.success(`Parcelas de ${ano} geradas com sucesso!`)
      setMostrarForm(false)
      fetchPagamentos()
    } catch {
      toast.error("Erro ao gerar parcelas.")
    } finally {
      setGerando(false)
    }
  }

  const confirmarPagamento = async () => {
    if (!dasParaPagar || !dataPagamento) {
      toast.warning("Informe a data de pagamento.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/das", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dasParaPagar.id,
          pago: true,
          data_pagamento: dataPagamento,
        }),
      })

      if (res.ok) {
        toast.success(`DAS de ${MESES[dasParaPagar.mes - 1]}/${dasParaPagar.ano} marcado como pago!`)
        setDasParaPagar(null)
        setDataPagamento("")
        fetchPagamentos()
      }
    } catch {
      toast.error("Erro ao atualizar pagamento.")
    } finally {
      setSaving(false)
    }
  }

  const desmarcarPagamento = async (das: PagamentoDAS) => {
    try {
      const res = await fetch("/api/das", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: das.id,
          pago: false,
          data_pagamento: null,
        }),
      })

      if (res.ok) {
        toast.success(`DAS de ${MESES[das.mes - 1]}/${das.ano} desmarcado.`)
        fetchPagamentos()
      }
    } catch {
      toast.error("Erro ao atualizar pagamento.")
    }
  }

  // Agrupar por ano
  const anosDisponiveis = [...new Set(pagamentos.map(p => p.ano))].sort((a, b) => b - a)

  const totalPago = pagamentos.filter(p => p.pago).reduce((acc, p) => acc + (Number(p.valor) || 0), 0)
  const totalPendente = pagamentos.filter(p => !p.pago).reduce((acc, p) => acc + (Number(p.valor) || 0), 0)
  const vencidos = pagamentos.filter(p => !p.pago && getStatusDAS(p).variant === "destructive").length

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Carregando pagamentos DAS...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Controle de Pagamento DAS</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe e registre os pagamentos mensais do DAS-MEI.
          </p>
        </div>
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Gerar Parcelas
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagamentos.length}</p>
                <p className="text-sm text-muted-foreground">Total de parcelas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatBRL(totalPago)}</p>
                <p className="text-sm text-muted-foreground">Total pago</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatBRL(totalPendente)}</p>
                <p className="text-sm text-muted-foreground">Total pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vencidos}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de parcelas por ano */}
      {anosDisponiveis.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma parcela DAS cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Gerar Parcelas" para criar as 12 parcelas do ano.
            </p>
          </CardContent>
        </Card>
      ) : (
        anosDisponiveis.map((ano) => {
          const parcelasDoAno = pagamentos
            .filter(p => p.ano === ano)
            .sort((a, b) => a.mes - b.mes)
          const pagasNoAno = parcelasDoAno.filter(p => p.pago).length

          return (
            <Card key={ano}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{ano}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {pagasNoAno}/{parcelasDoAno.length} pagas
                  </p>
                </div>
                {/* Barra de progresso */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted mt-2">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${(pagasNoAno / parcelasDoAno.length) * 100}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {parcelasDoAno.map((das) => {
                    const status = getStatusDAS(das)
                    const StatusIcon = status.icon
                    return (
                      <div
                        key={das.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          das.pago
                            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : status.variant === "destructive"
                              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                              : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`h-5 w-5 shrink-0 ${
                            das.pago
                              ? "text-green-600 dark:text-green-400"
                              : status.variant === "destructive"
                                ? "text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{MESES[das.mes - 1]}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBRL(Number(das.valor))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Venc: {formatData(das.data_vencimento)}
                            </p>
                            {das.pago && das.data_pagamento && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Pago em {formatData(das.data_pagamento)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          {das.pago ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => desmarcarPagamento(das)}
                            >
                              Desfazer
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setDasParaPagar(das)
                                setDataPagamento(
                                  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
                                )
                              }}
                            >
                              Pagar
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Modal gerar parcelas */}
      <Dialog open={mostrarForm} onOpenChange={setMostrarForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Parcelas DAS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={anoGerar} onValueChange={setAnoGerar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(a => (
                    <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor mensal do DAS (R$)</Label>
              <CurrencyInput value={valorDas} onChange={setValorDas} />
              <p className="text-xs text-muted-foreground">
                Valor padrão: {formatBRL(VALOR_DAS_PADRAO)} (Serviços). Ajuste conforme sua atividade.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Serão geradas 12 parcelas com vencimento no dia 20 do mês seguinte.
              Parcelas existentes terão o valor atualizado.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              <Button onClick={gerarParcelas} disabled={gerando}>
                {gerando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar 12 Parcelas"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar pagamento */}
      <AlertDialog open={!!dasParaPagar} onOpenChange={(open) => !open && setDasParaPagar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Pagamento</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Confirme o pagamento do DAS:</p>
                {dasParaPagar && (
                  <div className="rounded-md border p-3 space-y-1 text-sm">
                    <p><strong>Referência:</strong> {MESES[dasParaPagar.mes - 1]}/{dasParaPagar.ano}</p>
                    <p><strong>Valor:</strong> {formatBRL(Number(dasParaPagar.valor))}</p>
                    <p><strong>Vencimento:</strong> {formatData(dasParaPagar.data_vencimento)}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="dataPgto">Data do pagamento</Label>
                  <Input
                    id="dataPgto"
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarPagamento} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
