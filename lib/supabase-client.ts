// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

// 1. Procura as variáveis de ambiente com o prefixo OBRIGATÓRIO.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Lança um erro claro se as variáveis não forem encontradas.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Erro de configuração: As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não foram encontradas. Verifique o seu ficheiro .env.local")
}

console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 3. Exporta o cliente Supabase pronto para ser usado.
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
