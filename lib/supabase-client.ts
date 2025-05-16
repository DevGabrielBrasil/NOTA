import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof supabaseCreateClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias")
  }

  supabaseClient = supabaseCreateClient<Database>(supabaseUrl, supabaseKey) as ReturnType<typeof supabaseCreateClient<Database>>
  return supabaseClient
}
