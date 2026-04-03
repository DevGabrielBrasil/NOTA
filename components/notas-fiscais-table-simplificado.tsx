"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { cnpjMask, formatarData, formatarValor } from "@/utils/formatters"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, DownloadIcon, TrashIcon, NotepadText, Upload, FileEdit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { NotaFiscal } from "@/types/nota-fiscal"
import { useNotas } from "@/hooks/use-notas"
import { baixarResumoPdf } from "@/lib/baixarResumoPdf"

import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function NotasFiscaisTableSimplificado() {
  const { session } = useAuth()
  const [_errorState, setError] = useState<string | null>(null)
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null)
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [notaParaExcluir, setNotaParaExcluir] = useState<NotaFiscal | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [cnpj, setCnpj] = useState("")
  const { notas, error, loading, reloadNotas } = useNotas()

   useEffect(() => {
      if (session.user) {
        setCnpj(session.user.cnpj || "")
      }
    }, [session.user])

  const confirmarExclusao = async () => {
    if (!notaParaExcluir?.id) return
    setExcluindo(true)
    try {
      const response = await fetch(`/api/notas/${notaParaExcluir.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar nota fiscal')
      }

      toast.success("Nota fiscal excluída com sucesso!")
      reloadNotas()
      window.dispatchEvent(new Event("notaFiscalDeleted"))
    } catch (error) {
      toast.error("Erro ao deletar a nota fiscal.")
    } finally {
      setExcluindo(false)
      setNotaParaExcluir(null)
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>{formatarData(nota.data_emissao.toString())}</TableCell>
                  <TableCell>
                    {(nota as any).tipo === "importada" ? (
                      <Badge variant="secondary" className="text-xs">
                        <Upload className="mr-1 h-3 w-3" />
                        Importada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <FileEdit className="mr-1 h-3 w-3" />
                        Manual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatarValor(nota.valor_total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        className="cursor-pointer text-blue-600 hover:text-blue-800 p-1"
                        onClick={() => abrirResumo(nota)}
                        title="Ver detalhes"
                      >
                        <span className="text-lg"><NotepadText/></span>
                      </button>
                      <button
                        className="cursor-pointer text-red-600 hover:text-red-800 p-1"
                        onClick={() => setNotaParaExcluir(nota)}
                        title="Excluir nota"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="cursor-pointer text-blue-600 hover:text-blue-800 p-1"
                        onClick={() => baixarResumoPdf(nota)}
                        title="Baixar nota"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                    </div>
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

              <p><strong>Valor Total:</strong> {formatarValor(notaSelecionada.valor_total)}</p>
              <p><strong>Data de Emissão:</strong> {formatarData(notaSelecionada.data_emissao.toString())}</p>
              <p><strong>CNPJ:</strong> {cnpjMask(cnpj)}</p>
              <p><strong>Vale Transporte:</strong> {formatarValor(notaSelecionada.valor_total_transporte)}</p>
              <p><strong>Vale Refeição:</strong> {formatarValor(notaSelecionada.valor_total_refeicao)}</p>
              <p><strong>Salário:</strong> {formatarValor(notaSelecionada.salario)}</p>
              <p><strong>Data Início:</strong> {formatarData(notaSelecionada.data_inicio?.toString() || "")}</p>
              <p><strong>Data Fim:</strong> {formatarData(notaSelecionada.data_fim?.toString() || "")}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!notaParaExcluir} onOpenChange={(open) => !open && setNotaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Esta ação não pode ser desfeita. A seguinte nota será removida permanentemente:</p>
                {notaParaExcluir && (
                  <div className="rounded-md border p-3 mt-2 space-y-1 text-sm">
                    <p><strong>Data de Emissão:</strong> {formatarData(notaParaExcluir.data_emissao.toString())}</p>
                    <p><strong>Período:</strong> {formatarData(notaParaExcluir.data_inicio?.toString() || "")} - {formatarData(notaParaExcluir.data_fim?.toString() || "")}</p>
                    <p><strong>Valor Total:</strong> {formatarValor(notaParaExcluir.valor_total)}</p>
                    <p><strong>Salário:</strong> {formatarValor(notaParaExcluir.salario)}</p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluindo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Nota"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
