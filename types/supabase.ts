export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      notas_fiscais: {
        Row: {
          id: number
          data_emissao: string
          data_inicio: string
          data_fim: string
          salario: number
          valor_refeicao: number
          valor_transporte: number
          dias_trabalhados: number
          valor_total_refeicao: number
          valor_total_transporte: number
          valor_das: number // Adicionado campo para o DAS
          valor_total: number
          created_at: string
          cnpj?: string // Campo opcional para CNPJ
        }
        Insert: {
          id?: number
          data_emissao: string
          data_inicio: string
          data_fim: string
          salario: number
          valor_refeicao: number
          valor_transporte: number
          dias_trabalhados: number
          valor_total_refeicao: number
          valor_total_transporte: number
          valor_das: number // Adicionado campo para o DAS
          valor_total: number
          created_at?: string
          cnpj?: string // Campo opcional para CNPJ
        }
        Update: {
          id?: number
          data_emissao?: string
          data_inicio?: string
          data_fim?: string
          salario?: number
          valor_refeicao?: number
          valor_transporte?: number
          dias_trabalhados?: number
          valor_total_refeicao?: number
          valor_total_transporte?: number
          valor_das?: number // Adicionado campo para o DAS
          valor_total?: number
          created_at?: string
          cnpj?: string // Campo opcional para CNPJ
        }
      }
    }
  }
}
