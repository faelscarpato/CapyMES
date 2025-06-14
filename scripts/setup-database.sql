-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('production_orders', 'ai_alerts');

-- Dropar e recriar as tabelas para garantir estrutura correta
DROP TABLE IF EXISTS production_orders CASCADE;
DROP TABLE IF EXISTS ai_alerts CASCADE;

-- Criar tabela de ordens de produção
CREATE TABLE production_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Em produção', 'Concluída', 'Pendente')),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Crítica')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de alertas da IA
CREATE TABLE ai_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) mas permitir acesso público para demonstração
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público (apenas para demonstração)
CREATE POLICY "Enable read access for all users" ON production_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON production_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON production_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON production_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON ai_alerts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON ai_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON ai_alerts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON ai_alerts FOR DELETE USING (true);

-- Inserir dados de exemplo
INSERT INTO production_orders (product_name, status, quantity, priority) VALUES
('Produto A - Linha 1', 'Em produção', 100, 'Alta'),
('Produto B - Linha 2', 'Pendente', 50, 'Normal'),
('Produto C - Linha 1', 'Concluída', 75, 'Baixa'),
('Produto D - Linha 3', 'Em produção', 200, 'Crítica'),
('Produto E - Linha 2', 'Pendente', 150, 'Normal'),
('Produto F - Linha 1', 'Concluída', 80, 'Alta');

-- Inserir alertas de exemplo
INSERT INTO ai_alerts (title, message, severity, is_read) VALUES
('Eficiência Baixa Detectada', 'A linha de produção 1 está operando com 65% de eficiência. Recomenda-se verificação.', 'warning', false),
('Manutenção Preventiva', 'Equipamento X necessita manutenção preventiva em 2 dias.', 'info', false),
('Meta de Produção Atingida', 'Linha 2 atingiu 105% da meta diária!', 'success', true),
('Temperatura Elevada', 'Sensor de temperatura da linha 3 registrou 85°C. Verificar sistema de refrigeração.', 'error', false),
('Qualidade Aprovada', 'Lote #1247 passou na inspeção de qualidade com 99.2% de conformidade.', 'success', false);

-- Verificar se os dados foram inseridos
SELECT 'production_orders' as table_name, COUNT(*) as count FROM production_orders
UNION ALL
SELECT 'ai_alerts' as table_name, COUNT(*) as count FROM ai_alerts;
