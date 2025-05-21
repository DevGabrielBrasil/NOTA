-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpnj TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE OR REPLACE VIEW usuarios_com_auth AS
SELECT 
  u.id AS usuario_id,
  u.user_id,
  u.cpnj,
  u.created_at,
  u.updated_at,
  auth_users.email,
  auth_users.created_at AS user_created_at
FROM usuarios u
JOIN auth.users auth_users ON u.user_id = auth_users.id;


-- Políticas de segurança para a tabela de notas fiscais
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

grant insert on table public.usuarios to authenticator;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_metadata jsonb;
  cpnj text;
begin
  begin
    user_metadata := new.raw_user_meta_data;
    cpnj := user_metadata ->> 'cnpj';

    raise notice 'Inserindo novo usuário: %, CPNJ: %', new.id, cpnj;

    insert into public.usuarios (user_id, cpnj)
    values (new.id, cpnj);

  exception
    when others then
      raise notice 'Erro ao inserir usuário na tabela usuarios: %', SQLERRM;
      -- Não falha a trigger para não impedir o fluxo de criação do usuário
  end;

  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_insert on auth.users;

create trigger on_auth_user_insert
after insert on auth.users
for each row execute function public.handle_new_user();


CREATE POLICY "Permitir insert pelo usuário autenticado"
ON usuarios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios dados"
ON usuarios
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar seus próprios dados"
ON usuarios
FOR UPDATE
USING (auth.uid() = user_id);

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
