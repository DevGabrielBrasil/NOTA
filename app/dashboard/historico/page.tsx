"use client"

import { useState, useEffect } from "react"

import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatarValor, formatarData } from "@/utils/formatters"

interface Nota {
  id: number
  data_emissao: string
  valor_total: number
  cnpj?: string
  salario: number
  valor_refeicao: number
  valor_transporte: number
  data_inicio: string
  data_fim: string
  dias_trabalhados: number
}

function ResumoNotaModal({ nota, onClose }: { nota: Nota | null; onClose: () => void }) {
  if (!nota) return null

  return (
    <Dialog open={!!nota} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resumo da Nota Fiscal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Valor Total</p>
            <p className="font-semibold text-right">{formatarValor(nota.valor_total)}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Salário</p>
            <p className="font-semibold text-right">{formatarValor(nota.salario)}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Data de Emissão</p>
            <p className="font-semibold text-right">{formatarData(nota.data_emissao.toString().split('T')[0])}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Período</p>
            <p className="font-semibold text-right">
              {formatarData(nota.data_inicio.toString().split('T')[0])} - {formatarData(nota.data_fim.toString().split('T')[0])}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Dias Trabalhados</p>
            <p className="font-semibold text-right">{nota.dias_trabalhados}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


export default function HistoricoPage() {
  const { session } = useAuth()
  const [notas, setNotas] = useState<Nota[]>([])
  const [notaSelecionada, setNotaSelecionada] = useState<Nota | null>(null)

  useEffect(() => {
    const fetchNotas = async () => {
      if (!session.user) return

      try {
        const response = await fetch('/api/notas')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao carregar histórico')
        }

        setNotas(result.data || [])
      } catch (err) {
        console.error(err)
        toast.error("Erro ao buscar histórico de notas")
      }
    }

    fetchNotas()
  }, [session.user])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data de Emissão</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.length > 0 ? notas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>{formatarData(nota.data_emissao.toString().split('T')[0])}</TableCell>
                  <TableCell className="text-right">{formatarValor(nota.valor_total)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setNotaSelecionada(nota)}>
                      Ver Resumo
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Nenhuma nota encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ResumoNotaModal
        nota={notaSelecionada}
        onClose={() => setNotaSelecionada(null)}
      />
    </>
  )
}
