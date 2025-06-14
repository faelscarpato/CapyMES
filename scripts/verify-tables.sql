-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('production_orders', 'ai_alerts');

-- Contar registros nas tabelas
SELECT 'production_orders' as table_name, COUNT(*) as count FROM production_orders
UNION ALL
SELECT 'ai_alerts' as table_name, COUNT(*) as count FROM ai_alerts;

-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('production_orders', 'ai_alerts')
ORDER BY table_name, ordinal_position;
