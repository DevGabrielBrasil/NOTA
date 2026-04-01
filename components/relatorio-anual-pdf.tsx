"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileDown } from "lucide-react"
import { useNotas } from "@/hooks/use-notas"
import jsPDF from "jspdf"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const LIMITE_MEI = 81000

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatData(dateStr: string) {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dateStr
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function RelatorioAnualPdf() {
  const { notas, loading } = useNotas()
  const [gerando, setGerando] = useState(false)

  const gerarRelatorio = () => {
    setGerando(true)

    try {
      const anoAtual = new Date().getFullYear()
      const notasDoAno = notas.filter((n) => {
        const match = String(n.data_fim).match(/(\d{4})/)
        return match && parseInt(match[1]) === anoAtual
      })

      // Agrupar por mês
      const porMes: Record<number, { total: number; qtd: number }> = {}
      for (let i = 0; i < 12; i++) {
        porMes[i] = { total: 0, qtd: 0 }
      }
      for (const nota of notasDoAno) {
        const match = String(nota.data_fim).match(/\d{4}-(\d{2})/)
        const mes = match ? parseInt(match[1]) - 1 : 0
        porMes[mes].total += Number(nota.valor_total) || 0
        porMes[mes].qtd += 1
      }

      const totalAnual = Object.values(porMes).reduce((acc, v) => acc + v.total, 0)
      const percentualLimite = ((totalAnual / LIMITE_MEI) * 100).toFixed(2)

      const doc = new jsPDF()
      const azul = [37, 99, 235] as const
      let y = 0

      // Header
      doc.setFillColor(...azul)
      doc.rect(0, 0, 210, 35, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Sistema de Gestao MEI", 15, 18)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Relatorio Anual de Faturamento - ${anoAtual}`, 15, 28)

      // Resumo geral
      y = 50
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Resumo Geral", 15, y)

      y += 10
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Total faturado no ano: ${formatBRL(totalAnual)}`, 15, y)
      y += 7
      doc.text(`Limite MEI: ${formatBRL(LIMITE_MEI)}`, 15, y)
      y += 7
      doc.text(`Utilizacao do limite: ${percentualLimite}%`, 15, y)
      y += 7
      doc.text(`Total de notas emitidas: ${notasDoAno.length}`, 15, y)

      // Barra de progresso
      y += 10
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(15, y, 180, 6, 3, 3, "F")
      const larguraBarra = Math.min((totalAnual / LIMITE_MEI) * 180, 180)
      const corBarra = totalAnual / LIMITE_MEI >= 0.9 ? [239, 68, 68] as const
        : totalAnual / LIMITE_MEI >= 0.7 ? [245, 158, 11] as const
        : [34, 197, 94] as const
      doc.setFillColor(...corBarra)
      doc.roundedRect(15, y, larguraBarra, 6, 3, 3, "F")

      // Tabela mensal
      y += 20
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Faturamento por Mes", 15, y)

      y += 8
      // Cabeçalho da tabela
      doc.setFillColor(240, 240, 240)
      doc.rect(15, y, 180, 8, "F")
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(60, 60, 60)
      doc.text("Mes", 20, y + 6)
      doc.text("Notas", 100, y + 6)
      doc.text("Total", 145, y + 6)

      y += 8
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      for (let i = 0; i < 12; i++) {
        if (y > 270) {
          doc.addPage()
          y = 20
        }

        // Linhas alternadas
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(15, y, 180, 7, "F")
        }

        doc.setFontSize(10)
        doc.text(MESES[i], 20, y + 5)
        doc.text(String(porMes[i].qtd), 105, y + 5)
        doc.text(formatBRL(porMes[i].total), 145, y + 5)
        y += 7
      }

      // Linha total
      y += 2
      doc.setFillColor(...azul)
      doc.rect(15, y, 180, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL ANUAL", 20, y + 6)
      doc.text(String(notasDoAno.length), 105, y + 6)
      doc.text(formatBRL(totalAnual), 145, y + 6)

      // Detalhe das notas
      y += 20
      doc.setTextColor(0, 0, 0)
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Detalhamento das Notas", 15, y)

      y += 8
      doc.setFillColor(240, 240, 240)
      doc.rect(15, y, 180, 8, "F")
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(60, 60, 60)
      doc.text("Emissao", 18, y + 6)
      doc.text("Periodo", 52, y + 6)
      doc.text("Salario", 105, y + 6)
      doc.text("DAS", 135, y + 6)
      doc.text("Total", 163, y + 6)

      y += 8
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      for (let i = 0; i < notasDoAno.length; i++) {
        if (y > 275) {
          doc.addPage()
          y = 20
        }
        const n = notasDoAno[i]
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(15, y, 180, 7, "F")
        }
        doc.setFontSize(8)
        doc.text(formatData(n.data_emissao.toString()), 18, y + 5)
        doc.text(`${formatData(n.data_inicio.toString())} - ${formatData(n.data_fim.toString())}`, 52, y + 5)
        doc.text(formatBRL(Number(n.salario)), 105, y + 5)
        doc.text(formatBRL(Number(n.valor_das)), 135, y + 5)
        doc.text(formatBRL(Number(n.valor_total)), 163, y + 5)
        y += 7
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")} - Pagina ${p}/${totalPages}`,
          15,
          290,
        )
      }

      doc.save(`relatorio-anual-mei-${anoAtual}.pdf`)
    } finally {
      setGerando(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={gerarRelatorio}
      disabled={loading || gerando || notas.length === 0}
    >
      {gerando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Relatorio Anual PDF
        </>
      )}
    </Button>
  )
}
