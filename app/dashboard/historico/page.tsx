"use client"

import { useState, useEffect } from "react"

import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// Supondo que a estrutura de uma nota seja esta
interface Nota {
  id: number;
  numero_nota: string;
  nome_cliente: string;
  valor: number;
  status: 'Paga' | 'Pendente' | 'Cancelada';
  created_at: string;
  // Adicione outros campos da nota conforme necessário
}

// Componente do Modal de Resumo
function ResumoNotaModal({ nota, cnpj, onClose }: { nota: Nota | null; cnpj: string | undefined; onClose: () => void }) {
  if (!nota) return null

  return (
    <Dialog open={!!nota} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resumo da Nota Fiscal #{nota.numero_nota}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">CNPJ do Emissor</p>
            <p className="font-semibold text-right">{cnpj || "Não informado"}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Cliente</p>
            <p className="font-semibold text-right">{nota.nome_cliente}</p>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Valor</p>
            <p className="font-semibold text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nota.valor)}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Status</p>
            <div className="text-right">
              <Badge variant={nota.status === 'Paga' ? 'default' : 'destructive'}>{nota.status}</Badge>
            </div>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-muted-foreground">Data de Emissão</p>
            <p className="font-semibold text-right">{format(new Date(nota.created_at), "dd/MM/yyyy")}</p>
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
  
  // Busca o CNPJ dos metadados do usuário
  const cnpjDoUsuario = session.user?.user_metadata?.cnpj

  useEffect(() => {
    const fetchNotas = async () => {
      if (!session.user) return

      const response = await fetch('/api/notas')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar histórico')
      }
      
      const data = result.data
        .eq("user_id", session.user.id)
        // .order("created_at", { ascending: false }) // Opcional: ordenar as notas

      if (error) {
        toast.error("Erro ao buscar histórico de notas", { description: error.message })
      } else {
        setNotas(data || [])
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
                <TableHead>Nº da Nota</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.length > 0 ? notas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>{nota.numero_nota}</TableCell>
                  <TableCell>{nota.nome_cliente}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nota.valor)}</TableCell>
                  <TableCell>
                     <Badge variant={nota.status === 'Paga' ? 'default' : 'destructive'}>{nota.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setNotaSelecionada(nota)}>
                      Ver Resumo
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhuma nota encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ResumoNotaModal 
        nota={notaSelecionada} 
        cnpj={cnpjDoUsuario}
        onClose={() => setNotaSelecionada(null)} 
      />
    </>
  )
}
