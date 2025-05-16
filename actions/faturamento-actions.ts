"use server"

import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Valor padrão para o limite de faturamento do MEI
const LIMITE_FATURAMENTO_PADRAO = 81000

export async function getLimiteFaturamento(): Promise<number> {
  try {
    const supabase = createClient()
    const anoAtual = new Date().getFullYear()

    // Tentar buscar o limite diretamente, capturando qualquer erro
    try {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("limite_faturamento_anual")
        .eq("ano_fiscal", anoAtual)
        .maybeSingle()

      // Se houver erro ou não houver dados, retornar o valor padrão
      if (error || !data) {
        console.log("Erro ou sem dados ao buscar limite de faturamento, usando valor padrão:", error?.message)
        return LIMITE_FATURAMENTO_PADRAO
      }

      return data.limite_faturamento_anual || LIMITE_FATURAMENTO_PADRAO
    } catch (error) {
      // Se ocorrer qualquer erro (incluindo tabela não existente), retornar o valor padrão
      console.log("Exceção ao buscar limite de faturamento, usando valor padrão:", error)
      return LIMITE_FATURAMENTO_PADRAO
    }
  } catch (error) {
    console.error("Erro ao buscar limite de faturamento:", error)
    return LIMITE_FATURAMENTO_PADRAO
  }
}

export async function getFaturamentoTotal(): Promise<{ total: number; mediaPermitida: number }> {
  try {
    const supabase = createClient()
    const anoAtual = new Date().getFullYear()
    const mesAtual = new Date().getMonth() + 1 // Janeiro é 0
    const inicioAno = `${anoAtual}-01-01`
    const fimAno = `${anoAtual}-12-31`

    // Buscar o limite anual (já lida com tabela não existente)
    const limiteAnual = await getLimiteFaturamento()

    // Tentar buscar o faturamento total, capturando qualquer erro
    try {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("valor_total")
        .gte("data_emissao", inicioAno)
        .lte("data_emissao", fimAno)

      // Se houver erro, retornar valores padrão
      if (error) {
        console.log("Erro ao buscar faturamento total, usando valores padrão:", error.message)
        return { total: 0, mediaPermitida: limiteAnual / 12 }
      }

      const total = data.reduce((total, nota) => total + nota.valor_total, 0)
      const mesesRestantes = 12 - mesAtual

      if (mesesRestantes <= 0) {
        return { total, mediaPermitida: 0 }
      }

      const valorRestante = limiteAnual - total
      const mediaPermitida = valorRestante / mesesRestantes

      return { total, mediaPermitida }
    } catch (error) {
      // Se ocorrer qualquer erro (incluindo tabela não existente), retornar valores padrão
      console.log("Exceção ao buscar faturamento total, usando valores padrão:", error)
      return { total: 0, mediaPermitida: limiteAnual / 12 }
    }
  } catch (error) {
    console.error("Erro ao buscar faturamento total:", error)
    const limiteAnual = LIMITE_FATURAMENTO_PADRAO
    return { total: 0, mediaPermitida: limiteAnual / 12 }
  }
}

export async function getFaturamentoMensal() {
  try {
    const anoAtual = new Date().getFullYear()

    // Inicializar array com todos os meses do ano
    const meses = Array.from({ length: 12 }, (_, i) => {
      const data = new Date(anoAtual, i, 1)
      return {
        mes: format(data, "MMM", { locale: ptBR }),
        valor: 0,
      }
    })

    // Tentar buscar o faturamento mensal, capturando qualquer erro
    try {
      const supabase = createClient()
      const inicioAno = `${anoAtual}-01-01`
      const fimAno = `${anoAtual}-12-31`

      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("data_emissao, valor_total")
        .gte("data_emissao", inicioAno)
        .lte("data_emissao", fimAno)

      // Se houver erro, retornar array vazio
      if (error) {
        console.log("Erro ao buscar faturamento mensal, retornando dados vazios:", error.message)
        return meses
      }

      // Somar valores por mês
      if (data) {
        data.forEach((nota) => {
          const data = new Date(nota.data_emissao)
          const mesIndex = data.getMonth()
          meses[mesIndex].valor += nota.valor_total
        })
      }

      return meses
    } catch (error) {
      // Se ocorrer qualquer erro (incluindo tabela não existente), retornar array vazio
      console.log("Exceção ao buscar faturamento mensal, retornando dados vazios:", error)
      return meses
    }
  } catch (error) {
    console.error("Erro ao buscar faturamento mensal:", error)

    // Retornar array vazio em caso de erro
    const anoAtual = new Date().getFullYear()
    return Array.from({ length: 12 }, (_, i) => {
      const data = new Date(anoAtual, i, 1)
      return {
        mes: format(data, "MMM", { locale: ptBR }),
        valor: 0,
      }
    })
  }
}

export async function getValorMedioMensalPermitido(): Promise<number> {
  try {
    // Buscar o limite anual (já lida com tabela não existente)
    const limiteAnual = await getLimiteFaturamento()
    const anoAtual = new Date().getFullYear()
    const mesAtual = new Date().getMonth() + 1 // Janeiro é 0

    // Tentar buscar o faturamento atual, capturando qualquer erro
    try {
      const supabase = createClient()
      const { data: notasData, error: notasError } = await supabase
        .from("notas_fiscais")
        .select("valor_total")
        .gte("data_emissao", `${anoAtual}-01-01`)
        .lte("data_emissao", `${anoAtual}-12-31`)

      // Se houver erro, retornar valor médio padrão
      if (notasError) {
        console.log("Erro ao buscar faturamento, usando valor médio padrão:", notasError.message)
        return limiteAnual / 12
      }

      const faturamentoAtual = notasData.reduce((total, nota) => total + nota.valor_total, 0)
      const mesesRestantes = 12 - mesAtual

      if (mesesRestantes <= 0) {
        return 0 // Fim do ano
      }

      const valorRestante = limiteAnual - faturamentoAtual
      return valorRestante / mesesRestantes
    } catch (error) {
      // Se ocorrer qualquer erro (incluindo tabela não existente), retornar valor médio padrão
      console.log("Exceção ao calcular valor médio mensal permitido, usando valor padrão:", error)
      return limiteAnual / 12
    }
  } catch (error) {
    console.error("Erro ao calcular valor médio mensal permitido:", error)
    return LIMITE_FATURAMENTO_PADRAO / 12
  }
}
