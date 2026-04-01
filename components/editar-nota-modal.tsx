"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CurrencyInput } from "@/components/currency-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { calcularDiasUteis } from "@/actions/feriados-actions"
import type { NotaFiscal } from "@/types/nota-fiscal"

const formSchema = z
  .object({
    salario: z.number({ invalid_type_error: "Informe o salário" }).min(0, "O salário não pode ser negativo"),
    valorRefeicao: z.number({ invalid_type_error: "Informe o valor" }).min(0, "O valor não pode ser negativo"),
    valorTransporte: z.number({ invalid_type_error: "Informe o valor" }).min(0, "O valor não pode ser negativo"),
    dataInicio: z.date({ required_error: "A data de início é obrigatória" }),
    dataFim: z.date({ required_error: "A data de fim é obrigatória" }),
  })
  .refine((data) => data.dataFim >= data.dataInicio, {
    message: "A data final deve ser maior ou igual à data inicial",
    path: ["dataFim"],
  })

interface EditarNotaModalProps {
  notaId: number | null
  isOpen: boolean
  onClose: () => void
}

export function EditarNotaModal({ notaId, isOpen, onClose }: EditarNotaModalProps) {
  const [diasUteis, setDiasUteis] = useState<number | null>(null)
  const [isCalculando, setIsCalculando] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [valorTotalCalculado, setValorTotalCalculado] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salario: 0,
      valorRefeicao: 0,
      valorTransporte: 0,
      dataInicio: new Date(),
      dataFim: new Date(),
    },
  })

  const dataInicio = form.watch("dataInicio")
  const dataFim = form.watch("dataFim")
  const salario = form.watch("salario")
  const valorRefeicao = form.watch("valorRefeicao")
  const valorTransporte = form.watch("valorTransporte")

  // Carregar dados da nota fiscal via API
  useEffect(() => {
    const carregarNota = async () => {
      if (notaId && isOpen) {
        setIsLoading(true)
        try {
          const response = await fetch('/api/notas')
          const result = await response.json()
          if (!response.ok) throw new Error(result.error)

          const nota = (result.data as NotaFiscal[]).find((n) => n.id === notaId)
          if (nota) {
            const di = parse(nota.data_inicio.toString().split('T')[0], "yyyy-MM-dd", new Date())
            const df = parse(nota.data_fim.toString().split('T')[0], "yyyy-MM-dd", new Date())

            form.reset({
              salario: Number(nota.salario),
              valorRefeicao: Number(nota.valor_refeicao),
              valorTransporte: Number(nota.valor_transporte),
              dataInicio: di,
              dataFim: df,
            })

            setDiasUteis(nota.dias_trabalhados)
            setValorTotalCalculado(Number(nota.valor_total))
          }
        } catch (error) {
          console.error("Erro ao carregar nota fiscal:", error)
          toast.error("Erro ao carregar nota fiscal", {
            description: "Não foi possível carregar os dados da nota fiscal.",
          })
          onClose()
        } finally {
          setIsLoading(false)
        }
      }
    }

    carregarNota()
  }, [notaId, isOpen])

  // Atualizar o valor total calculado
  useEffect(() => {
    const dias = diasUteis ?? 0
    const valorTotalRefeicao = dias * (Number(valorRefeicao) || 0)
    const valorTotalTransporte = dias * (Number(valorTransporte) || 0)
    const total = (Number(salario) || 0) + valorTotalRefeicao + valorTotalTransporte
    setValorTotalCalculado(total)
  }, [diasUteis, salario, valorRefeicao, valorTransporte])

  // Calcular dias úteis quando as datas mudarem
  useEffect(() => {
    const calcularDias = async () => {
      if (dataInicio && dataFim) {
        setIsCalculando(true)
        try {
          const dias = await calcularDiasUteis(dataInicio, dataFim)
          setDiasUteis(dias)
        } catch (error) {
          console.error("Erro ao calcular dias úteis:", error)
          toast.error("Erro ao calcular dias úteis")
        } finally {
          setIsCalculando(false)
        }
      } else {
        setDiasUteis(null)
      }
    }

    calcularDias()
  }, [dataInicio, dataFim])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!notaId || !diasUteis) {
      toast.error("Dados incompletos. Tente novamente.")
      return
    }

    setIsSubmitting(true)
    try {
      const valorTotalRefeicao = diasUteis * values.valorRefeicao
      const valorTotalTransporte = diasUteis * values.valorTransporte
      const valorTotal = values.salario + valorTotalRefeicao + valorTotalTransporte

      const response = await fetch(`/api/notas/${notaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_inicio: values.dataInicio.toISOString().split('T')[0],
          data_fim: values.dataFim.toISOString().split('T')[0],
          salario: values.salario,
          valor_refeicao: values.valorRefeicao,
          valor_transporte: values.valorTransporte,
          dias_trabalhados: diasUteis,
          valor_total_refeicao: valorTotalRefeicao,
          valor_total_transporte: valorTotalTransporte,
          valor_total: valorTotal,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao editar nota fiscal')
      }

      toast.success("Nota fiscal atualizada com sucesso!", {
        description: `Valor total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotal)}`,
      })

      window.dispatchEvent(new Event("notaFiscalCreated"))
      onClose()
    } catch (error) {
      console.error("Erro ao editar nota fiscal:", error)
      toast.error("Erro ao editar nota fiscal", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Nota Fiscal</DialogTitle>
          <DialogDescription>Edite os dados da nota fiscal. Clique em salvar quando terminar.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorRefeicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Refeição (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorTransporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Transporte (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataFim"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Fim</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Dias Úteis:</h3>
                    <p className="text-xl font-bold">
                      {isCalculando ? <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> : diasUteis ?? "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Salário:</h3>
                    <p className="text-xl font-bold">{formatBRL(Number(salario) || 0)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Total Refeição:</h3>
                    <p className="text-xl font-bold">{formatBRL((diasUteis ?? 0) * (Number(valorRefeicao) || 0))}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Total Transporte:</h3>
                    <p className="text-xl font-bold">{formatBRL((diasUteis ?? 0) * (Number(valorTransporte) || 0))}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-sm text-blue-700">Valor Total da Nota:</h3>
                  <p className="text-2xl font-bold text-blue-700">{formatBRL(valorTotalCalculado ?? 0)}</p>
                  <p className="text-xs text-blue-600 mt-1">(Salário + Total Refeição + Total Transporte)</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isCalculando || diasUteis === null}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
