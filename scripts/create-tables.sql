-- Tabela de notas fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
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

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  limite_faturamento_anual NUMERIC NOT NULL DEFAULT 81000,
  ano_fiscal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ano_fiscal)
);

-- Políticas de segurança para a tabela de notas fiscais
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notas"
ON notas_fiscais FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notas"
ON notas_fiscais FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notas"
ON notas_fiscais FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias notas"
ON notas_fiscais FOR DELETE
USING (auth.uid() = user_id);

-- Políticas de segurança para a tabela de configurações
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias configurações"
ON configuracoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações"
ON configuracoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON configuracoes FOR UPDATE
USING (auth.uid() = user_id);
