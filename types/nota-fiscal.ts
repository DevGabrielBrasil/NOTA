export interface NotaFiscal {
  id?: number;
  data_emissao: Date
  data_inicio: Date
  data_fim: Date
  salario: number
  valor_refeicao: number
  valor_transporte: number
  dias_trabalhados: number
  valor_total_refeicao: number
  valor_total_transporte: number
  valor_das: number
  valor_total: number
  cnpj?: string
  tipo?: 'manual' | 'importada'
  numero_nota?: string
  descricao?: string
}

export interface NotaFiscalInput {
  dataInicio: Date
  dataFim: Date
  salario: number
  valorRefeicao: number
  valorTransporte: number
  valorDas: number // Adicionado campo para o DAS
  diasUteis: number
  valorTotalRefeicao: number
  valorTotalTransporte: number
  valorTotal: number
  cnpj?: string // Campo opcional para CNPJ
}
