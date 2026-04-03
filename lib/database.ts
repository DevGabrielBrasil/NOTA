import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDatabase() {
  return pool;
}

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // user_id é TEXT para compatibilidade com os IDs do Better Auth
    await client.query(`
      CREATE TABLE IF NOT EXISTS notas_fiscais (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        data_emissao DATE NOT NULL,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        salario NUMERIC NOT NULL,
        valor_refeicao NUMERIC NOT NULL,
        valor_transporte NUMERIC NOT NULL,
        valor_das NUMERIC DEFAULT 0,
        dias_trabalhados INTEGER NOT NULL,
        valor_total_refeicao NUMERIC NOT NULL,
        valor_total_transporte NUMERIC NOT NULL,
        valor_total NUMERIC NOT NULL,
        cnpj TEXT,
        tipo TEXT DEFAULT 'manual',
        numero_nota TEXT,
        descricao TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Adicionar colunas para notas já existentes (migração segura)
    await client.query(`ALTER TABLE notas_fiscais ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'manual'`);
    await client.query(`ALTER TABLE notas_fiscais ADD COLUMN IF NOT EXISTS numero_nota TEXT`);
    await client.query(`ALTER TABLE notas_fiscais ADD COLUMN IF NOT EXISTS descricao TEXT`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        limite_faturamento_anual NUMERIC DEFAULT 81000.00,
        ano_fiscal INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, ano_fiscal)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pagamentos_das (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        valor NUMERIC NOT NULL,
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        pago BOOLEAN DEFAULT false,
        observacao TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, mes, ano)
      )
    `);

    console.log('Tabelas da aplicação inicializadas com sucesso');
  } finally {
    client.release();
  }
}
