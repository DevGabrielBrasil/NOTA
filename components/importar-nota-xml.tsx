"use client"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { parseNotaFiscalXml, type DadosNotaImportada } from "@/lib/parse-nfe-xml"
import { useAuth } from "@/contexts/auth-context"

export function ImportarNotaXml() {
  const { session } = useAuth()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [dadosExtraidos, setDadosExtraidos] = useState<DadosNotaImportada | null>(null)
  const [erroParser, setErroParser] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataReferencia, setDataReferencia] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const formatData = (d: string) => {
    const match = d.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (!match) return d
    return `${match[3]}/${match[2]}/${match[1]}`
  }

  const formatCnpj = (cnpj: string) => {
    if (cnpj.length !== 14) return cnpj
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setDadosExtraidos(null)
    setErroParser(null)

    if (!file) {
      setArquivo(null)
      return
    }

    if (!file.name.toLowerCase().endsWith(".xml")) {
      setErroParser("Selecione um arquivo XML.")
      setArquivo(null)
      return
    }

    setArquivo(file)

    try {
      const text = await file.text()
      const dados = parseNotaFiscalXml(text)

      if (!dados) {
        setErroParser("Não foi possível identificar os dados da nota fiscal neste XML. Verifique se é um XML de NF-e ou NFS-e válido.")
        return
      }

      if (!dados.dataEmissao) {
        setErroParser("A data de emissão não foi encontrada no XML. Verifique o arquivo.")
        return
      }

      setDadosExtraidos(dados)
      setDataReferencia(dados.dataEmissao)
    } catch {
      setErroParser("Erro ao ler o arquivo XML.")
    }
  }

  const handleImportar = async () => {
    if (!dadosExtraidos || !session?.user) return

    if (!dataReferencia) {
      toast.warning("Informe a data de referência da nota.")
      return
    }

    setIsSubmitting(true)
    try {
      const notaFiscal = {
        data_emissao: dataReferencia,
        data_inicio: dataReferencia,
        data_fim: dataReferencia,
        salario: 0,
        valor_refeicao: 0,
        valor_transporte: 0,
        valor_das: 0,
        dias_trabalhados: 0,
        valor_total_refeicao: 0,
        valor_total_transporte: 0,
        valor_total: dadosExtraidos.valorTotal,
        cnpj: dadosExtraidos.cnpjPrestador || session.user.cnpj,
        tipo: "importada",
        numero_nota: dadosExtraidos.numero,
        descricao: dadosExtraidos.descricao,
      }

      const response = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notaFiscal),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar nota fiscal")
      }

      toast.success("Nota fiscal importada com sucesso!", {
        description: `Valor: ${formatBRL(dadosExtraidos.valorTotal)}`,
      })

      window.dispatchEvent(new Event("notaFiscalCreated"))

      // Limpar
      setArquivo(null)
      setDadosExtraidos(null)
      setErroParser(null)
      setDataReferencia("")
      if (inputRef.current) inputRef.current.value = ""
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro ao importar", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const limpar = () => {
    setArquivo(null)
    setDadosExtraidos(null)
    setErroParser(null)
    setDataReferencia("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="space-y-3">
        <Label htmlFor="xml-file">Arquivo XML da Nota Fiscal</Label>
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            id="xml-file"
            type="file"
            accept=".xml"
            onChange={handleFileChange}
          />
          {arquivo && (
            <Button variant="ghost" size="icon" onClick={limpar} title="Limpar">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Aceita arquivos XML de NFS-e (Emissor Nacional) e NF-e. O sistema irá extrair automaticamente o valor total e a data de emissão.
        </p>
      </div>

      {/* Erro */}
      {erroParser && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Erro na leitura</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{erroParser}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview dos dados extraídos */}
      {dadosExtraidos && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="font-medium text-green-800 dark:text-green-300">
                Dados identificados com sucesso!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-background">
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {dadosExtraidos.tipo === "nfse" ? "NFS-e (Serviço)" : "NF-e (Produto)"}
                </p>
              </div>
              {dadosExtraidos.numero && (
                <div>
                  <p className="text-xs text-muted-foreground">Numero da Nota</p>
                  <p className="font-medium">{dadosExtraidos.numero}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-primary">
                  {formatBRL(dadosExtraidos.valorTotal)}
                </p>
              </div>
              {dadosExtraidos.cnpjPrestador && (
                <div>
                  <p className="text-xs text-muted-foreground">CNPJ Prestador</p>
                  <p className="font-medium">{formatCnpj(dadosExtraidos.cnpjPrestador)}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="font-medium text-sm">{dadosExtraidos.descricao}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-lg border bg-background">
              <Label htmlFor="data-referencia" className="text-sm font-medium">
                Data de referência da nota
              </Label>
              <Input
                id="data-referencia"
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Data extraída do XML. Ajuste se necessário — ela define em qual mês a nota será contabilizada no faturamento.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleImportar} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Confirmar e Importar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={limpar} disabled={isSubmitting}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dica quando não há arquivo */}
      {!arquivo && !erroParser && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-4 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3" />
              <p className="font-medium">Como funciona?</p>
              <ol className="text-sm mt-2 space-y-1 text-left max-w-md">
                <li>1. Acesse o <strong>Emissor Nacional</strong> e emita sua nota fiscal</li>
                <li>2. Baixe o <strong>arquivo XML</strong> da nota emitida</li>
                <li>3. Faça o upload do XML aqui</li>
                <li>4. Confira os dados extraidos e confirme a importação</li>
              </ol>
              <p className="text-xs mt-3">
                O valor total será incluido automaticamente no cálculo do seu faturamento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
