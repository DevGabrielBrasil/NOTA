import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof supabaseCreateClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias")
  }

  supabaseClient = supabaseCreateClient<Database>(supabaseUrl, supabaseKey) as ReturnType<typeof supabaseCreateClient<Database>>
  return supabaseClient
}
