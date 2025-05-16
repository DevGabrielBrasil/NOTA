"use server"

interface CNPJInfo {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  data_situacao_cadastral: string
  regime_tributario: string
  simples_nacional?: boolean
  mei?: boolean
}

export async function buscarCNPJ(cnpj: string): Promise<CNPJInfo | null> {
  try {
    // Remover caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, "")

    if (cnpjLimpo.length !== 14) {
      throw new Error("CNPJ inválido. O CNPJ deve conter 14 dígitos.")
    }

    // Usar a API BrasilAPI para buscar informações do CNPJ
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("CNPJ não encontrado.")
      }
      throw new Error(`Erro ao buscar CNPJ: ${response.statusText}`)
    }

    const data = await response.json()

    // Formatar os dados para o formato que precisamos
    return {
      cnpj: data.cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia || "",
      situacao_cadastral: data.situacao_cadastral,
      data_situacao_cadastral: data.data_situacao_cadastral,
      regime_tributario: data.regime_tributario || "Não informado",
      simples_nacional: data.opcao_pelo_simples || false,
      mei: data.opcao_pelo_mei || false,
    }
  } catch (error) {
    console.error("Erro ao buscar informações do CNPJ:", error)
    return null
  }
}

// Função para calcular o valor aproximado do DAS para MEI
// Convertendo para async conforme solicitado no erro
export async function calcularDasMEI(anoReferencia: number = new Date().getFullYear()): Promise<number> {
  // Valores aproximados do DAS para MEI em 2023
  // Estes valores podem mudar anualmente
  const valoresDAS = {
    2023: 66.1, // Valor base para 2023
    2024: 70.6, // Valor estimado para 2024
  }

  // Retornar o valor para o ano de referência ou o valor mais recente
  return valoresDAS[anoReferencia] || valoresDAS[2024]
}
