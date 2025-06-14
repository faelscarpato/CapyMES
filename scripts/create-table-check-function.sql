-- Função para verificar se tabelas existem
CREATE OR REPLACE FUNCTION get_table_names(schema_name text, table_names text[])
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
    existing_tables text[] := '{}';
    tbl_name text;
BEGIN
    FOREACH tbl_name IN ARRAY table_names
    LOOP
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = schema_name 
            AND table_name = tbl_name
        ) THEN
            existing_tables := array_append(existing_tables, tbl_name);
        END IF;
    END LOOP;
    
    RETURN existing_tables;
END;
$$;

-- Dar permissões para usar a função
GRANT EXECUTE ON FUNCTION get_table_names(text, text[]) TO anon;
GRANT EXECUTE ON FUNCTION get_table_names(text, text[]) TO authenticated;
