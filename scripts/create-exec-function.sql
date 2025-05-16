-- Função para executar SQL dinamicamente
CREATE OR REPLACE FUNCTION exec(query text, params jsonb default '[]')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query INTO result USING params;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;
