import { NotaFiscal } from "@/types/nota-fiscal"
import jsPDF from "jspdf"

export function baixarResumoPdf(nota: NotaFiscal) {
  const doc = new jsPDF()

  // Define o conteúdo do resumo
  const conteudo = `
Resumo da Nota Fiscal
Valor Total: R$ ${nota.valor_total}

Data de Emissão: ${nota.data_emissao}

CNPJ: ${nota.cnpj}

Vale Transporte: R$ ${nota.valor_total_transporte}
Vale Refeição: R$ ${nota.valor_total_refeicao}
Salário: R$ ${nota.salario}

Data Início: ${nota.data_inicio}
Data Fim: ${nota.data_fim}
  `

  doc.setFont("Helvetica")
  doc.setFontSize(12)
  doc.text(conteudo, 10, 10)
  doc.save("resumo-nota.pdf")
}
