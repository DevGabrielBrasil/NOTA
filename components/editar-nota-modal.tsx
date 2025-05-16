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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { editarNotaFiscal, getNotaFiscalById } from "@/actions/nota-fiscal-actions"
import { calcularDiasUteis } from "@/actions/feriados-actions"
import { useAppContext } from "@/contexts/app-context"
import type { NotaFiscal } from "@/types/nota-fiscal"

const formSchema = z
  .object({
    salario: z.coerce.number().positive("O salário deve ser maior que zero"),
    valorRefeicao: z.coerce.number().positive("O valor da refeição deve ser maior que zero"),
    valorTransporte: z.coerce.number().positive("O valor do transporte deve ser maior que zero"),
    dataInicio: z.date({
      required_error: "A data de início é obrigatória",
    }),
    dataFim: z.date({
      required_error: "A data de fim é obrigatória",
    }),
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
  const { refreshData } = useAppContext()
  const { toast } = useToast()
  const [diasUteis, setDiasUteis] = useState<number | null>(null)
  const [isCalculando, setIsCalculando] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [valorTotalCalculado, setValorTotalCalculado] = useState<number | null>(null)
  const [notaOriginal, setNotaOriginal] = useState<NotaFiscal | null>(null)

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

  // Carregar dados da nota fiscal
  useEffect(() => {
    const carregarNota = async () => {
      if (notaId && isOpen) {
        setIsLoading(true)
        try {
          const nota = await getNotaFiscalById(notaId)
          if (nota) {
            setNotaOriginal(nota)

            // Converter strings de data para objetos Date
            const dataInicio = parse(nota.data_inicio, "yyyy-MM-dd", new Date())
            const dataFim = parse(nota.data_fim, "yyyy-MM-dd", new Date())

            form.reset({
              salario: nota.salario,
              valorRefeicao: nota.valor_refeicao,
              valorTransporte: nota.valor_transporte,
              dataInicio,
              dataFim,
            })

            setDiasUteis(nota.dias_trabalhados)
            setValorTotalCalculado(nota.valor_total)
          }
        } catch (error) {
          console.error("Erro ao carregar nota fiscal:", error)
          toast({
            title: "Erro ao carregar nota fiscal",
            description: "Não foi possível carregar os dados da nota fiscal. Tente novamente.",
            variant: "destructive",
          })
          onClose()
        } finally {
          setIsLoading(false)
        }
      }
    }

    carregarNota()
  }, [notaId, isOpen, form, toast, onClose])

  // Atualizar o valor total calculado sempre que os valores mudarem
  useEffect(() => {
    if (diasUteis !== null) {
      const valorTotalRefeicao = diasUteis * valorRefeicao
      const valorTotalTransporte = diasUteis * valorTransporte
      const total = Number(salario) + valorTotalRefeicao + valorTotalTransporte
      setValorTotalCalculado(total)
    } else {
      setValorTotalCalculado(null)
    }
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
          toast({
            title: "Erro ao calcular dias úteis",
            description: "Não foi possível calcular os dias úteis. Tente novamente.",
            variant: "destructive",
          })
        } finally {
          setIsCalculando(false)
        }
      } else {
        setDiasUteis(null)
      }
    }

    calcularDias()
  }, [dataInicio, dataFim, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!notaId || !diasUteis) {
      toast({
        title: "Erro ao editar nota fiscal",
        description: "Dados incompletos. Tente novamente.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const valorTotalRefeicao = diasUteis * values.valorRefeicao
      const valorTotalTransporte = diasUteis * values.valorTransporte
      const valorTotal = Number(values.salario) + valorTotalRefeicao + valorTotalTransporte

      await editarNotaFiscal(notaId, {
        ...values,
        diasUteis,
        valorTotalRefeicao,
        valorTotalTransporte,
        valorTotal,
      })

      toast({
        title: "Nota fiscal atualizada com sucesso!",
        description: `Valor total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotal)}`,
      })

      refreshData() // Atualiza o contexto global
      onClose() // Fecha o modal
    } catch (error) {
      console.error("Erro ao editar nota fiscal:", error)
      toast({
        title: "Erro ao editar nota fiscal",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Não foi possível editar a nota fiscal. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            locale={ptBR}
                          />
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
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            locale={ptBR}
                          />
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
                      {isCalculando ? (
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      ) : diasUteis !== null ? (
                        diasUteis
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Salário:</h3>
                    <p className="text-xl font-bold">
                      {salario
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(salario)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Total Refeição:</h3>
                    <p className="text-xl font-bold">
                      {diasUteis !== null && valorRefeicao
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            diasUteis * valorRefeicao,
                          )
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Total Transporte:</h3>
                    <p className="text-xl font-bold">
                      {diasUteis !== null && valorTransporte
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            diasUteis * valorTransporte,
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Adicionar o valor total calculado */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-sm text-blue-700">Valor Total da Nota:</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {valorTotalCalculado !== null
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          valorTotalCalculado,
                        )
                      : "-"}
                  </p>
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
