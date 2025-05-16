-- Verificar se a tabela usuarios existe e criar se não existir
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  nome TEXT,
  empresa TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela notas_fiscais existe e criar se não existir
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES usuarios(id),
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
  migrado_de_local BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela configuracoes existe e criar se não existir
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES usuarios(id),
  limite_faturamento_anual NUMERIC NOT NULL DEFAULT 81000,
  ano_fiscal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ano_fiscal)
);

-- Configurar políticas de segurança para a tabela usuarios
DO $$
BEGIN
  -- Habilitar RLS
  ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
  
  -- Criar políticas se não existirem
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Usuários podem ver seus próprios dados'
  ) THEN
    CREATE POLICY "Usuários podem ver seus próprios dados"
    ON usuarios FOR SELECT
    USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Usuários podem atualizar seus próprios dados'
  ) THEN
    CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON usuarios FOR UPDATE
    USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Usuários podem inserir seus próprios dados'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios dados"
    ON usuarios FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao configurar políticas para a tabela usuarios: %', SQLERRM;
END $$;

-- Configurar políticas de segurança para a tabela notas_fiscais
DO $$
BEGIN
  -- Habilitar RLS
  ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
  
  -- Criar políticas se não existirem
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'notas_fiscais' AND policyname = 'Usuários podem ver suas próprias notas'
  ) THEN
    CREATE POLICY "Usuários podem ver suas próprias notas"
    ON notas_fiscais FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'notas_fiscais' AND policyname = 'Usuários podem inserir suas próprias notas'
  ) THEN
    CREATE POLICY "Usuários podem inserir suas próprias notas"
    ON notas_fiscais FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'notas_fiscais' AND policyname = 'Usuários podem atualizar suas próprias notas'
  ) THEN
    CREATE POLICY "Usuários podem atualizar suas próprias notas"
    ON notas_fiscais FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'notas_fiscais' AND policyname = 'Usuários podem excluir suas próprias notas'
  ) THEN
    CREATE POLICY "Usuários podem excluir suas próprias notas"
    ON notas_fiscais FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao configurar políticas para a tabela notas_fiscais: %', SQLERRM;
END $$;

-- Configurar políticas de segurança para a tabela configuracoes
DO $$
BEGIN
  -- Habilitar RLS
  ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
  
  -- Criar políticas se não existirem
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'configuracoes' AND policyname = 'Usuários podem ver suas próprias configurações'
  ) THEN
    CREATE POLICY "Usuários podem ver suas próprias configurações"
    ON configuracoes FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'configuracoes' AND policyname = 'Usuários podem inserir suas próprias configurações'
  ) THEN
    CREATE POLICY "Usuários podem inserir suas próprias configurações"
    ON configuracoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'configuracoes' AND policyname = 'Usuários podem atualizar suas próprias configurações'
  ) THEN
    CREATE POLICY "Usuários podem atualizar suas próprias configurações"
    ON configuracoes FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao configurar políticas para a tabela configuracoes: %', SQLERRM;
END $$;
