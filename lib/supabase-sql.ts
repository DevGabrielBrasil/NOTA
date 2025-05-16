import { createClient } from "@/lib/supabase-server"

export async function executarSQL(query: string, params?: any[]): Promise<any> {
  try {
    console.log("Executando SQL:", query)
    const supabase = createClient()

    // Tentar executar o SQL diretamente
    try {
      const { data, error } = await supabase.rpc("exec", { query, params })

      if (error) {
        console.error("Erro ao executar SQL via RPC:", error)
        throw error
      }

      return data
    } catch (rpcError) {
      console.error("Erro ao executar SQL via RPC:", rpcError)

      // Se falhar, tentar executar como uma consulta direta
      try {
        const { data, error } = await supabase.from("_dummy_query_direct").select().limit(1)

        // Se chegou aqui sem erro, algo estranho aconteceu
        console.log("Consulta direta funcionou, mas não deveria:", data)
        throw new Error("Não foi possível executar o SQL. A função RPC 'exec' não está disponível.")
      } catch (directError) {
        // Esperado falhar, apenas para verificar se a conexão está funcionando
        console.log("Erro esperado na consulta direta:", directError)

        // Retornar uma mensagem mais amigável
        throw new Error(
          "Não foi possível executar o SQL. Verifique se a função RPC 'exec' está disponível no seu projeto Supabase. " +
            "Você pode criar esta função no SQL Editor do Supabase com o seguinte código:\n\n" +
            "CREATE OR REPLACE FUNCTION exec(query text, params jsonb default '[]')\n" +
            "RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$\n" +
            "DECLARE\n" +
            "  result JSONB;\n" +
            "BEGIN\n" +
            "  EXECUTE query INTO result USING params;\n" +
            "  RETURN result;\n" +
            "EXCEPTION WHEN OTHERS THEN\n" +
            "  RAISE;\n" +
            "END;\n" +
            "$$;",
        )
      }
    }
  } catch (error) {
    console.error("Erro ao executar SQL:", error)
    throw error
  }
}
