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
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

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

    console.log('Tabelas da aplicação inicializadas com sucesso');
  } finally {
    client.release();
  }
}
