-- Criar tabela para armazenar senhas dos usuários
-- ATENÇÃO: Em produção, as senhas devem ser hasheadas com bcrypt ou similar

CREATE TABLE IF NOT EXISTS user_passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL, -- Em produção seria um hash bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passwords_email ON user_passwords(email);

-- Adicionar constraint de email único
ALTER TABLE user_passwords ADD CONSTRAINT unique_user_email UNIQUE (email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_passwords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_user_passwords_updated_at ON user_passwords;
CREATE TRIGGER trigger_update_user_passwords_updated_at
    BEFORE UPDATE ON user_passwords
    FOR EACH ROW
    EXECUTE FUNCTION update_user_passwords_updated_at();

-- Comentários para documentação
COMMENT ON TABLE user_passwords IS 'Tabela para armazenar senhas dos usuários (em produção usar hash)';
COMMENT ON COLUMN user_passwords.password_hash IS 'Senha do usuário (em produção deve ser hasheada com bcrypt)';

-- Verificar se a tabela foi criada
SELECT 'Tabela user_passwords criada com sucesso!' as status;
