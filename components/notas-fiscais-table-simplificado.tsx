"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatarData, formatarValor } from "@/utils/formatters"
import { Loader2, AlertTriangle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import type { NotaFiscal } from "@/types/nota-fiscal"

export function NotasFiscaisTableSimplificado() {
  const { session } = useAuth()
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabelaNaoExiste, setTabelaNaoExiste] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null)
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const carregarNotas = async () => {
      if (!session?.user) return

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("notas_fiscais")
          .select("*")
          .eq("user_id", session.user.id)
          .order("data_emissao", { ascending: false })

        if (error) {
          if (
            error.message.includes("does not exist") ||
            error.message.includes("relation") ||
            error.message.includes("não existe")
          ) {
            setTabelaNaoExiste(true)
            return
          }
          throw error
        }

        setNotas(data || [])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation") ||
          errorMessage.includes("não existe")
        ) {
          setTabelaNaoExiste(true)
        } else {
          setError(`Erro ao carregar notas fiscais: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    }

    carregarNotas()

    const handleNotaCreated = () => carregarNotas()
    window.addEventListener("notaFiscalCreated", handleNotaCreated)
    return () => window.removeEventListener("notaFiscalCreated", handleNotaCreated)
  }, [session?.user, supabase])

  const handleSetupDatabase = () => router.push("/setup")

  const handleDeleteNota = async (id: number) => {
    const { error } = await supabase.from("notas_fiscais").delete().eq("id", id)
    if (error) {
      setError("Erro ao deletar a nota fiscal.")
    } else {
      setNotas((prev) => prev.filter((nota) => nota.id !== id))
    }
  }

  const abrirResumo = (nota: NotaFiscal) => {
    setNotaSelecionada(nota)
    setMostrarResumo(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Carregando notas fiscais...</p>
      </div>
    )
  }

  if (tabelaNaoExiste) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Banco de dados não configurado</AlertTitle>
        <AlertDescription>
          A tabela de notas fiscais não foi encontrada no banco de dados.
          <Button onClick={handleSetupDatabase} className="mt-4">
            <Database className="mr-2 h-4 w-4" />
            Configurar Banco de Dados
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (notas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhuma nota fiscal encontrada.</p>
          <p className="text-sm text-muted-foreground mt-2">Crie uma nova nota fiscal na aba "Nova Nota Fiscal".</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data de Emissão</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>{formatarData(nota.data_emissao.toString())}</TableCell>
                  <TableCell className="text-right">{formatarValor(nota.valor_total)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <span
                      className="cursor-pointer text-blue-600"
                      onClick={() => abrirResumo(nota)}
                      title="Ver detalhes"
                    >
                      🗒️
                    </span>
                    <span
                      className="cursor-pointer text-red-600"
                      onClick={() => handleDeleteNota(nota.id!)}
                      title="Excluir nota"
                    >
                      🗑️
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {notaSelecionada && (
        <Dialog open={mostrarResumo} onOpenChange={setMostrarResumo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resumo da Nota Fiscal</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Descrição:</strong> {notaSelecionada.descricao}</p>
              <p><strong>Valor Total:</strong> {formatarValor(notaSelecionada.valor_total)}</p>
              <p><strong>Data de Emissão:</strong> {formatarData(notaSelecionada.data_emissao.toString())}</p>
              <p><strong>Tomador:</strong> {notaSelecionada.tomador_nome}</p>
              <p><strong>CNPJ/CPF:</strong> {notaSelecionada.tomador_cpf_cnpj}</p>
              <p><strong>Serviço:</strong> {notaSelecionada.servico}</p>

              <p><strong>Vale Transporte:</strong> {formatarValor(notaSelecionada.vale_transporte)}</p>
              <p><strong>Vale Refeição:</strong> {formatarValor(notaSelecionada.vale_refeicao)}</p>
              <p><strong>Salário:</strong> {formatarValor(notaSelecionada.salario)}</p>
              <p><strong>Data Início:</strong> {formatarData(notaSelecionada.data_inicio?.toString() || "")}</p>
              <p><strong>Data Fim:</strong> {formatarData(notaSelecionada.data_fim?.toString() || "")}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}