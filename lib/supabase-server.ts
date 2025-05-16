import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias")
  }

  return supabaseCreateClient<Database>(supabaseUrl, supabaseKey)
}

export async function verificarConexao() {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("notas_fiscais").select("count").limit(1)

    if (error) {
      console.error("Erro ao verificar conexão com o banco de dados:", error)
      return { conectado: false, erro: error.message }
    }

    return { conectado: true, erro: null }
  } catch (error) {
    console.error("Erro ao verificar conexão com o banco de dados:", error)
    return {
      conectado: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
