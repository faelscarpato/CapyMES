-- Verificar se a tabela users existe e tem o tipo correto para id
DO $$
BEGIN
    -- Verificar se a coluna id é do tipo UUID
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- Se a tabela existe mas não tem UUID, recriar
        DROP TABLE IF EXISTS users CASCADE;
        
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'operator', 'maintenance', 'quality')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

        -- Função para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_users_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        -- Trigger para updated_at
        DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
        CREATE TRIGGER trigger_update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_users_updated_at();

        -- Inserir usuário admin padrão
        INSERT INTO users (name, email, role) VALUES 
        ('Administrador', 'admin@capymes.com', 'admin')
        ON CONFLICT (email) DO NOTHING;

        RAISE NOTICE 'Tabela users recriada com UUID';
    ELSE
        RAISE NOTICE 'Tabela users já existe com UUID';
    END IF;
END $$;

SELECT 'Verificação da tabela users concluída!' as status;
