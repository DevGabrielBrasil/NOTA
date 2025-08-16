"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PeriodoSelector } from "@/components/periodo-selector"
import { calcularDiasUteis } from "@/actions/feriados-actions"
import { Card, CardContent } from "@/components/ui/card"
import type { NotaFiscal } from "@/types/nota-fiscal"
import type { DateRange } from "react-day-picker"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

const formSchema = z.object({
  salario: z.coerce.number().min(0, "O salário não pode ser negativo"),
  valorRefeicao: z.coerce.number().min(0, "O valor da refeição não pode ser negativo"),
  valorTransporte: z.coerce.number().min(0, "O valor do transporte não pode ser negativo"),
  valorDas: z.coerce.number().min(0, "O valor do DAS não pode ser negativo"),
  periodo: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => {
        // Verificar se ambas as datas estão presentes
        if (!data.from || !data.to) return false
        // Verificar se a data final é maior ou igual à data inicial
        return data.to >= data.from
      },
      {
        message: "Selecione um período válido (data final deve ser maior ou igual à data inicial)",
        path: ["to"],
      },
    ),
})

export function NotaFiscalFormSimplificado() {
  const { session } = useAuth()
  const [diasUteis, setDiasUteis] = useState<number | null>(null)
  const [isCalculando, setIsCalculando] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [valorTotalCalculado, setValorTotalCalculado] = useState<number | null>(null)


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salario: undefined,
      valorRefeicao: undefined,
      valorTransporte: undefined,
      valorDas: undefined,
      periodo: {
        from: undefined,
        to: undefined,
      },
    },
  })

  const salario = form.watch("salario")
  const valorRefeicao = form.watch("valorRefeicao")
  const valorTransporte = form.watch("valorTransporte")
  const valorDas = form.watch("valorDas")
  const periodo = form.watch("periodo")

  // Atualizar o valor total calculado sempre que os valores mudarem
  useEffect(() => {
    if (diasUteis !== null) {
      const valorTotalRefeicao = diasUteis * valorRefeicao
      const valorTotalTransporte = diasUteis * valorTransporte
      const total = Number(salario) + valorTotalRefeicao + valorTotalTransporte + Number(valorDas)
      setValorTotalCalculado(total)
    } else {
      setValorTotalCalculado(null)
    }
  }, [diasUteis, salario, valorRefeicao, valorTransporte, valorDas])

  // Calcular dias úteis quando o período mudar
  useEffect(() => {
    const calcularDias = async () => {
      if (periodo?.from && periodo?.to) {
        setIsCalculando(true)
        try {
          const dias = await calcularDiasUteis(periodo.from, periodo.to)
          setDiasUteis(dias)
        } catch (error) {
          console.error("Erro ao calcular dias úteis:", error)
          toast.error("Erro ao calcular dias úteis",{
            description: "Não foi possível calcular os dias úteis. Tente novamente.",
          })
          setDiasUteis(null)
        } finally {
          setIsCalculando(false)
        }
      } else {
        setDiasUteis(null)
      }
    }

    calcularDias()
  }, [periodo?.from, periodo?.to, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  if (isSubmitting) return // <-- Proteção contra duplo clique

  if (!values.periodo?.from || !values.periodo?.to || !diasUteis) {
    toast.error("Erro ao criar nota fiscal",{
      description: "Selecione um período válido.",
    })
    return
  }

  setIsSubmitting(true)
  try {
    const valorTotalRefeicao = diasUteis * values.valorRefeicao
    const valorTotalTransporte = diasUteis * values.valorTransporte
    const valorTotal = Number(values.salario) + valorTotalRefeicao + valorTotalTransporte + Number(values.valorDas)

    if (!session?.user) {
      throw new Error("Usuário não autenticado")
    }

    // Verificação opcional de duplicidade
    const { data: existentes } = await supabaseClient
      .from("notas_fiscais")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("data_inicio", values.periodo.from)
      .eq("data_fim", values.periodo.to)

    if (existentes && existentes.length > 0) {
      toast.error("Nota fiscal já existe",{
        description: "Você já criou uma nota para este período.",
      })
      return
    }

    const notaFiscal: NotaFiscal = {
      data_emissao: new Date(Date.now()),
      data_inicio: values.periodo.from,
      data_fim: values.periodo.to,
      salario: values.salario,
      valor_refeicao: values.valorRefeicao,
      valor_transporte: values.valorTransporte,
      valor_das: values.valorDas,
      dias_trabalhados: diasUteis,
      valor_total_refeicao: valorTotalRefeicao,
      valor_total_transporte: valorTotalTransporte,
      valor_total: valorTotal,
    }

    const { error, data } = await supabaseClient.from("notas_fiscais").insert({
      ...notaFiscal,
      user_id: session.user.id,
    })

    if (error) throw error

    toast.success("Nota fiscal criada com sucesso!",{
      description: `Valor total: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valorTotal)}`,
    })

    form.reset({
      salario: 0,
      valorRefeicao: 0,
      valorTransporte: 0,
      valorDas: 0,
      periodo: { from: undefined, to: undefined },
    })
    setDiasUteis(null)
    setValorTotalCalculado(null)
  } catch (error) {
    console.error("Erro ao criar nota fiscal:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.includes("does not exist") ||
      errorMessage.includes("relation") ||
      errorMessage.includes("não existe")
    ) {
      
    } else {
      toast.error("Erro ao criar nota fiscal",{
        description: errorMessage,
      })
    }
  } finally {
    setIsSubmitting(false)
  }
}


  const handlePeriodoChange = (range: DateRange) => {
    // Garantir que o range não seja nulo
    const safeRange = {
      from: range?.from || undefined,
      to: range?.to || undefined,
    }
    form.setValue("periodo", safeRange, { shouldValidate: true })
  }

  const salarioFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(salario ?? 0) + Number(valorDas ?? 0)
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="periodo"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Período (Dia inicial até Dia final)</FormLabel>
                <FormControl>
                  <PeriodoSelector
                    value={field.value as DateRange}
                    onChange={handlePeriodoChange}
                    defaultMonth={new Date()}
                  />
                </FormControl>
                <FormMessage />
                {!field.value.from || !field.value.to ? (
                  <p className="text-sm text-muted-foreground">Selecione o período completo da nota fiscal</p>
                ) : null}
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="valorDas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor DAS (R$)</FormLabel>
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
        </div>

        <Card className="bg-muted">
          <CardContent className="pt-6">
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
                <h3 className="font-medium text-sm">Salário + DAS:</h3>
                <p className="text-xl font-bold">
                  {salarioFormatado === "R$ NaN" ? 0 : salarioFormatado}
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

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h3 className="font-medium text-sm text-blue-700">Valor Total da Nota:</h3>
              <p className="text-2xl font-bold text-blue-700">
                {valorTotalCalculado !== null
                  ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotalCalculado)
                  : "-"}
              </p>
              <p className="text-xs text-blue-600 mt-1">(Salário + DAS + Total Refeição + Total Transporte)</p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting || isCalculando || diasUteis === null || !periodo?.from || !periodo?.to
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando nota fiscal...
            </>
          ) : 
            "Criar Nota Fiscal"
        }
        </Button>
      </form>
    </Form>
  )
}
