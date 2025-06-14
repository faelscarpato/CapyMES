-- Limpar tabelas existentes
DROP TABLE IF EXISTS quality_inspections CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS traceability_records CASCADE;
DROP TABLE IF EXISTS production_lines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS production_orders CASCADE;
DROP TABLE IF EXISTS ai_alerts CASCADE;

-- Criar tabela de usuários
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator', 'maintenance', 'quality')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de linhas de produção
CREATE TABLE production_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    capacity INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de equipamentos
CREATE TABLE equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    production_line_id UUID REFERENCES production_lines(id),
    status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'broken', 'idle')),
    last_maintenance DATE,
    next_maintenance DATE,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de ordens de produção (atualizada)
CREATE TABLE production_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Em produção', 'Concluída', 'Pendente', 'Pausada', 'Cancelada')),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    produced_quantity INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Crítica')),
    production_line_id UUID REFERENCES production_lines(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- em minutos
    actual_duration INTEGER, -- em minutos
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de inspeções de qualidade
CREATE TABLE quality_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_number VARCHAR(100) UNIQUE NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    inspector_id UUID REFERENCES users(id),
    inspection_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'rework')),
    sample_size INTEGER DEFAULT 1,
    defects_found INTEGER DEFAULT 0,
    conformity_rate DECIMAL(5,2) DEFAULT 100.00,
    observations TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de ordens de manutenção
CREATE TABLE maintenance_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    equipment_id UUID REFERENCES equipment(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('preventive', 'corrective', 'predictive')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Crítica')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    cost DECIMAL(10,2),
    parts_used TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de rastreabilidade
CREATE TABLE traceability_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_number VARCHAR(100) NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    equipment_id UUID REFERENCES equipment(id),
    operation VARCHAR(255) NOT NULL,
    operator_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parameters JSONB,
    quality_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de alertas da IA (atualizada)
CREATE TABLE ai_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('production', 'quality', 'maintenance', 'efficiency', 'general')),
    source_table VARCHAR(100),
    source_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de configurações do sistema
CREATE TABLE system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE traceability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso público (demonstração)
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all access for production_lines" ON production_lines FOR ALL USING (true);
CREATE POLICY "Enable all access for equipment" ON equipment FOR ALL USING (true);
CREATE POLICY "Enable all access for production_orders" ON production_orders FOR ALL USING (true);
CREATE POLICY "Enable all access for quality_inspections" ON quality_inspections FOR ALL USING (true);
CREATE POLICY "Enable all access for maintenance_orders" ON maintenance_orders FOR ALL USING (true);
CREATE POLICY "Enable all access for traceability_records" ON traceability_records FOR ALL USING (true);
CREATE POLICY "Enable all access for ai_alerts" ON ai_alerts FOR ALL USING (true);
CREATE POLICY "Enable all access for system_settings" ON system_settings FOR ALL USING (true);

-- Inserir dados iniciais
INSERT INTO users (name, email, role) VALUES
('João Silva', 'joao@capymes.com', 'admin'),
('Maria Santos', 'maria@capymes.com', 'supervisor'),
('Pedro Costa', 'pedro@capymes.com', 'operator'),
('Ana Oliveira', 'ana@capymes.com', 'quality'),
('Carlos Ferreira', 'carlos@capymes.com', 'maintenance');

INSERT INTO production_lines (name, description, status, capacity) VALUES
('Linha 1 - Montagem', 'Linha principal de montagem de produtos', 'active', 150),
('Linha 2 - Embalagem', 'Linha de embalagem e acabamento', 'active', 200),
('Linha 3 - Teste', 'Linha de testes e controle de qualidade', 'active', 100);

INSERT INTO equipment (name, code, type, production_line_id, status, last_maintenance, next_maintenance) VALUES
('Esteira Principal', 'EST-001', 'Transporte', (SELECT id FROM production_lines WHERE name = 'Linha 1 - Montagem'), 'operational', '2024-01-15', '2024-04-15'),
('Robot Soldador', 'ROB-001', 'Soldagem', (SELECT id FROM production_lines WHERE name = 'Linha 1 - Montagem'), 'operational', '2024-02-01', '2024-05-01'),
('Máquina Embalagem', 'EMB-001', 'Embalagem', (SELECT id FROM production_lines WHERE name = 'Linha 2 - Embalagem'), 'maintenance', '2024-01-20', '2024-04-20'),
('Tester Automático', 'TST-001', 'Teste', (SELECT id FROM production_lines WHERE name = 'Linha 3 - Teste'), 'operational', '2024-02-10', '2024-05-10');

INSERT INTO production_orders (order_number, product_name, product_code, status, quantity, produced_quantity, priority, production_line_id, start_date, estimated_duration, created_by) VALUES
('OP-2024-001', 'Produto Alpha', 'ALPHA-001', 'Em produção', 100, 65, 'Alta', (SELECT id FROM production_lines WHERE name = 'Linha 1 - Montagem'), NOW() - INTERVAL '2 hours', 480, (SELECT id FROM users WHERE email = 'joao@capymes.com')),
('OP-2024-002', 'Produto Beta', 'BETA-001', 'Pendente', 50, 0, 'Normal', (SELECT id FROM production_lines WHERE name = 'Linha 2 - Embalagem'), NULL, 240, (SELECT id FROM users WHERE email = 'maria@capymes.com')),
('OP-2024-003', 'Produto Gamma', 'GAMMA-001', 'Concluída', 75, 75, 'Baixa', (SELECT id FROM production_lines WHERE name = 'Linha 1 - Montagem'), NOW() - INTERVAL '1 day', 360, (SELECT id FROM users WHERE email = 'joao@capymes.com'));

INSERT INTO quality_inspections (inspection_number, production_order_id, inspector_id, inspection_type, status, sample_size, defects_found, conformity_rate, observations) VALUES
('QI-2024-001', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-001'), (SELECT id FROM users WHERE email = 'ana@capymes.com'), 'Inspeção Visual', 'approved', 10, 0, 100.00, 'Produto conforme especificações'),
('QI-2024-002', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-003'), (SELECT id FROM users WHERE email = 'ana@capymes.com'), 'Teste Funcional', 'approved', 5, 1, 80.00, 'Um item com defeito menor'),
('QI-2024-003', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-001'), (SELECT id FROM users WHERE email = 'ana@capymes.com'), 'Inspeção Dimensional', 'pending', 15, 0, 0.00, 'Aguardando inspeção');

INSERT INTO maintenance_orders (order_number, equipment_id, type, priority, status, description, assigned_to, scheduled_date, estimated_hours, created_by) VALUES
('MO-2024-001', (SELECT id FROM equipment WHERE code = 'EMB-001'), 'corrective', 'Alta', 'in_progress', 'Substituição de correia transportadora', (SELECT id FROM users WHERE email = 'carlos@capymes.com'), NOW() + INTERVAL '1 hour', 4.0, (SELECT id FROM users WHERE email = 'maria@capymes.com')),
('MO-2024-002', (SELECT id FROM equipment WHERE code = 'ROB-001'), 'preventive', 'Normal', 'open', 'Manutenção preventiva mensal', (SELECT id FROM users WHERE email = 'carlos@capymes.com'), NOW() + INTERVAL '2 days', 2.5, (SELECT id FROM users WHERE email = 'joao@capymes.com')),
('MO-2024-003', (SELECT id FROM equipment WHERE code = 'TST-001'), 'predictive', 'Baixa', 'completed', 'Calibração de sensores', (SELECT id FROM users WHERE email = 'carlos@capymes.com'), NOW() - INTERVAL '1 day', 1.5, (SELECT id FROM users WHERE email = 'maria@capymes.com'));

INSERT INTO traceability_records (batch_number, production_order_id, equipment_id, operation, operator_id, parameters, quality_data) VALUES
('BATCH-2024-001', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-001'), (SELECT id FROM equipment WHERE code = 'EST-001'), 'Transporte Inicial', (SELECT id FROM users WHERE email = 'pedro@capymes.com'), '{"speed": 1.2, "temperature": 22}', '{"weight": 1.5, "dimensions": "10x5x3"}'),
('BATCH-2024-001', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-001'), (SELECT id FROM equipment WHERE code = 'ROB-001'), 'Soldagem', (SELECT id FROM users WHERE email = 'pedro@capymes.com'), '{"temperature": 350, "pressure": 2.5}', '{"weld_quality": "A", "resistance": 95}'),
('BATCH-2024-002', (SELECT id FROM production_orders WHERE order_number = 'OP-2024-003'), (SELECT id FROM equipment WHERE code = 'TST-001'), 'Teste Final', (SELECT id FROM users WHERE email = 'pedro@capymes.com'), '{"voltage": 12, "current": 2.1}', '{"pass": true, "score": 98}');

INSERT INTO ai_alerts (title, message, severity, category, source_table, is_read) VALUES
('Eficiência Baixa Detectada', 'A linha de produção 1 está operando com 65% de eficiência. Recomenda-se verificação.', 'warning', 'efficiency', 'production_lines', false),
('Manutenção Preventiva Vencida', 'Equipamento EMB-001 está com manutenção preventiva vencida há 5 dias.', 'error', 'maintenance', 'equipment', false),
('Meta de Produção Atingida', 'Ordem OP-2024-003 foi concluída com sucesso!', 'success', 'production', 'production_orders', true),
('Qualidade Abaixo do Padrão', 'Inspeção QI-2024-002 detectou taxa de conformidade de 80%. Investigar causa.', 'warning', 'quality', 'quality_inspections', false),
('Equipamento em Manutenção', 'Robot Soldador ROB-001 entrará em manutenção preventiva em 2 dias.', 'info', 'maintenance', 'equipment', false);

INSERT INTO system_settings (key, value, description, category) VALUES
('company_name', 'CapyMEs Industries', 'Nome da empresa', 'general'),
('oee_target', '85', 'Meta de OEE em porcentagem', 'production'),
('quality_threshold', '95', 'Limite mínimo de qualidade em porcentagem', 'quality'),
('maintenance_alert_days', '7', 'Dias de antecedência para alertas de manutenção', 'maintenance'),
('shift_duration', '8', 'Duração do turno em horas', 'production');

-- Verificar dados inseridos
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'production_lines', COUNT(*) FROM production_lines
UNION ALL SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'production_orders', COUNT(*) FROM production_orders
UNION ALL SELECT 'quality_inspections', COUNT(*) FROM quality_inspections
UNION ALL SELECT 'maintenance_orders', COUNT(*) FROM maintenance_orders
UNION ALL SELECT 'traceability_records', COUNT(*) FROM traceability_records
UNION ALL SELECT 'ai_alerts', COUNT(*) FROM ai_alerts
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings;
