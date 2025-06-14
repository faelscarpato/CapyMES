-- Habilitar RLS (Row Level Security)
ALTER TABLE IF EXISTS production_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_alerts DISABLE ROW LEVEL SECURITY;

-- Dropar tabelas se existirem (para recriar)
DROP TABLE IF EXISTS production_orders CASCADE;
DROP TABLE IF EXISTS ai_alerts CASCADE;

-- Criar tabela de ordens de produção
CREATE TABLE production_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Em produção', 'Concluída', 'Pendente')),
    quantity INTEGER DEFAULT 1,
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

-- Desabilitar RLS para permitir acesso público (apenas para demonstração)
ALTER TABLE production_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts DISABLE ROW LEVEL SECURITY;

-- Inserir dados de exemplo
INSERT INTO production_orders (product_name, status, quantity, priority) VALUES
('Produto A - Linha 1', 'Em produção', 100, 'Alta'),
('Produto B - Linha 2', 'Pendente', 50, 'Normal'),
('Produto C - Linha 1', 'Concluída', 75, 'Baixa'),
('Produto D - Linha 3', 'Em produção', 200, 'Crítica'),
('Produto E - Linha 2', 'Pendente', 150, 'Normal');

-- Inserir alertas de exemplo
INSERT INTO ai_alerts (title, message, severity) VALUES
('Eficiência Baixa Detectada', 'A linha de produção 1 está operando com 65% de eficiência. Recomenda-se verificação.', 'warning'),
('Manutenção Preventiva', 'Equipamento X necessita manutenção preventiva em 2 dias.', 'info'),
('Meta de Produção Atingida', 'Linha 2 atingiu 105% da meta diária!', 'success'),
('Temperatura Elevada', 'Sensor de temperatura da linha 3 registrou 85°C. Verificar sistema de refrigeração.', 'error');
