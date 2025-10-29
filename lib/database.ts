import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Criar tabelas se não existirem
  await initializeTables();
  
  return db;
}

async function initializeTables() {
  if (!db) return;

  // Tabela de usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de notas fiscais
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data_emissao DATE NOT NULL,
      data_inicio DATE NOT NULL,
      data_fim DATE NOT NULL,
      salario REAL NOT NULL,
      valor_refeicao REAL NOT NULL,
      valor_transporte REAL NOT NULL,
      valor_das REAL DEFAULT 0,
      dias_trabalhados INTEGER NOT NULL,
      valor_total_refeicao REAL NOT NULL,
      valor_total_transporte REAL NOT NULL,
      valor_total REAL NOT NULL,
      cnpj TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabela de configurações
  await db.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      limite_faturamento_anual REAL DEFAULT 81000.00,
      ano_fiscal INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, ano_fiscal),
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  console.log('Tabelas do banco de dados inicializadas com sucesso');
}