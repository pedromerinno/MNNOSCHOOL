-- =====================================================
-- FASE 3: LIMPEZA DE DADOS REDUNDANTES
-- =====================================================
-- 
-- Esta migração:
-- 1. Migra passwords restantes de password para password_encrypted
-- 2. Atualiza funções para usar apenas password_encrypted
-- 3. Remove coluna password após migração completa
--
-- RISCO: ALTO - Modifica dados e estrutura
-- IMPACTO: ALTO - Remove redundância e melhora segurança
-- =====================================================
-- 
-- IMPORTANTE: Esta migration requer que pgsodium esteja habilitado
-- e que todas as funções de criptografia estejam funcionando
-- =====================================================

-- =====================================================
-- PARTE 1: MIGRAR PASSWORDS RESTANTES
-- =====================================================

-- Função temporária para migrar passwords de company_access
DO $$
DECLARE
  rec RECORD;
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Migrar passwords de company_access que ainda estão em texto plano
  FOR rec IN 
    SELECT id, password 
    FROM public.company_access 
    WHERE password IS NOT NULL 
    AND (password_encrypted IS NULL OR password_encrypted = '')
  LOOP
    BEGIN
      -- Gerar chave de criptografia
      encryption_key := pgsodium.crypto_aead_det_keygen();
      
      -- Criptografar password
      encrypted_pass := encode(
        pgsodium.crypto_aead_det_encrypt(
          convert_to(rec.password, 'utf8'),
          convert_to('password_context', 'utf8'),
          encryption_key
        ),
        'base64'
      );
      
      -- Atualizar registro
      UPDATE public.company_access
      SET 
        password_encrypted = encrypted_pass,
        encryption_key = encryption_key
      WHERE id = rec.id;
      
      RAISE NOTICE 'Migrated password for company_access id: %', rec.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to migrate password for company_access id %: %', rec.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Função temporária para migrar passwords de user_access
DO $$
DECLARE
  rec RECORD;
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Migrar passwords de user_access que ainda estão em texto plano
  FOR rec IN 
    SELECT id, password 
    FROM public.user_access 
    WHERE password IS NOT NULL 
    AND (password_encrypted IS NULL OR password_encrypted = '')
  LOOP
    BEGIN
      -- Gerar chave de criptografia
      encryption_key := pgsodium.crypto_aead_det_keygen();
      
      -- Criptografar password
      encrypted_pass := encode(
        pgsodium.crypto_aead_det_encrypt(
          convert_to(rec.password, 'utf8'),
          convert_to('password_context', 'utf8'),
          encryption_key
        ),
        'base64'
      );
      
      -- Atualizar registro
      UPDATE public.user_access
      SET 
        password_encrypted = encrypted_pass,
        encryption_key = encryption_key
      WHERE id = rec.id;
      
      RAISE NOTICE 'Migrated password for user_access id: %', rec.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to migrate password for user_access id %: %', rec.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- PARTE 2: ATUALIZAR FUNÇÕES PARA USAR APENAS password_encrypted
-- =====================================================

-- Atualizar função get_company_access_decrypted para não usar password
CREATE OR REPLACE FUNCTION public.get_company_access_decrypted(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  tool_name TEXT,
  username TEXT,
  password_decrypted TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  created_by UUID
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := (select auth.uid());
  
  -- Verificar autorização usando funções otimizadas
  IF NOT (
    public.check_super_admin() 
    OR public.check_company_admin(p_company_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Retornar dados descriptografados (apenas de password_encrypted)
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    CASE 
      WHEN ca.password_encrypted IS NOT NULL AND ca.encryption_key IS NOT NULL THEN
        public.decrypt_password(ca.password_encrypted, ca.encryption_key)
      ELSE NULL -- Não usar password em texto plano
    END as password_decrypted,
    ca.url,
    ca.notes,
    ca.created_at,
    ca.created_by
  FROM public.company_access ca
  WHERE ca.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função get_user_access_decrypted para não usar password
CREATE OR REPLACE FUNCTION public.get_user_access_decrypted()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  tool_name TEXT,
  username TEXT,
  password_decrypted TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Retornar dados descriptografados apenas do usuário atual (apenas de password_encrypted)
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.tool_name,
    ua.username,
    CASE 
      WHEN ua.password_encrypted IS NOT NULL AND ua.encryption_key IS NOT NULL THEN
        public.decrypt_password(ua.password_encrypted, ua.encryption_key)
      ELSE NULL -- Não usar password em texto plano
    END as password_decrypted,
    ua.url,
    ua.notes,
    ua.created_at,
    ua.updated_at
  FROM public.user_access ua
  WHERE ua.user_id = (select auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função create_company_access para não salvar password em texto plano
CREATE OR REPLACE FUNCTION public.create_company_access(
  p_company_id UUID,
  p_tool_name TEXT,
  p_username TEXT,
  p_password TEXT,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Gerar chave de criptografia
  encryption_key := pgsodium.crypto_aead_det_keygen();
  
  -- Criptografar password
  encrypted_pass := encode(
    pgsodium.crypto_aead_det_encrypt(
      convert_to(p_password, 'utf8'),
      convert_to('password_context', 'utf8'),
      encryption_key
    ),
    'base64'
  );
  
  -- Inserir registro (sem password em texto plano)
  INSERT INTO public.company_access (
    company_id,
    tool_name,
    username,
    password_encrypted,
    encryption_key,
    url,
    notes,
    created_by
  ) VALUES (
    p_company_id,
    p_tool_name,
    p_username,
    encrypted_pass,
    encryption_key,
    p_url,
    p_notes,
    (select auth.uid())
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função update_company_access para não salvar password em texto plano
CREATE OR REPLACE FUNCTION public.update_company_access(
  p_id UUID,
  p_tool_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Se password está sendo atualizado, criptografar
  IF p_password IS NOT NULL THEN
    -- Obter chave existente ou gerar nova
    SELECT company_access.encryption_key INTO encryption_key
    FROM public.company_access 
    WHERE id = p_id;
    
    IF encryption_key IS NULL THEN
      encryption_key := pgsodium.crypto_aead_det_keygen();
    END IF;
    
    -- Criptografar novo password
    encrypted_pass := encode(
      pgsodium.crypto_aead_det_encrypt(
        convert_to(p_password, 'utf8'),
        convert_to('password_context', 'utf8'),
        encryption_key
      ),
      'base64'
    );
  END IF;
  
  -- Atualizar registro (sem password em texto plano)
  UPDATE public.company_access SET
    tool_name = COALESCE(p_tool_name, tool_name),
    username = COALESCE(p_username, username),
    password_encrypted = COALESCE(encrypted_pass, password_encrypted),
    encryption_key = COALESCE(encryption_key, company_access.encryption_key),
    url = COALESCE(p_url, url),
    notes = COALESCE(p_notes, notes)
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função create_user_access para não salvar password em texto plano
CREATE OR REPLACE FUNCTION public.create_user_access(
  p_tool_name TEXT,
  p_username TEXT,
  p_password TEXT,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Gerar chave de criptografia
  encryption_key := pgsodium.crypto_aead_det_keygen();
  
  -- Criptografar password
  encrypted_pass := encode(
    pgsodium.crypto_aead_det_encrypt(
      convert_to(p_password, 'utf8'),
      convert_to('password_context', 'utf8'),
      encryption_key
    ),
    'base64'
  );
  
  -- Inserir registro (sem password em texto plano)
  INSERT INTO public.user_access (
    user_id,
    tool_name,
    username,
    password_encrypted,
    encryption_key,
    url,
    notes
  ) VALUES (
    (select auth.uid()),
    p_tool_name,
    p_username,
    encrypted_pass,
    encryption_key,
    p_url,
    p_notes
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- PARTE 3: REMOVER COLUNA password (APÓS MIGRAÇÃO COMPLETA)
-- =====================================================
-- 
-- NOTA: Esta parte está comentada por segurança.
-- Descomente apenas após verificar que todos os passwords foram migrados
-- e que as funções estão funcionando corretamente.
-- =====================================================

-- Verificar se todos os passwords foram migrados antes de remover a coluna
DO $$
DECLARE
  company_access_count INTEGER;
  user_access_count INTEGER;
BEGIN
  -- Verificar company_access
  SELECT COUNT(*) INTO company_access_count
  FROM public.company_access
  WHERE password IS NOT NULL 
  AND (password_encrypted IS NULL OR password_encrypted = '');
  
  -- Verificar user_access
  SELECT COUNT(*) INTO user_access_count
  FROM public.user_access
  WHERE password IS NOT NULL 
  AND (password_encrypted IS NULL OR password_encrypted = '');
  
  -- Se ainda houver passwords não migrados, não remover a coluna
  IF company_access_count > 0 OR user_access_count > 0 THEN
    RAISE WARNING 'Ainda existem % registros em company_access e % em user_access com password não migrado. Coluna password não será removida.', 
      company_access_count, user_access_count;
    RETURN;
  END IF;
  
  -- Se todos foram migrados, podemos remover a coluna (comentado por segurança)
  -- ALTER TABLE public.company_access DROP COLUMN IF EXISTS password;
  -- ALTER TABLE public.user_access DROP COLUMN IF EXISTS password;
  
  RAISE NOTICE 'Todos os passwords foram migrados com sucesso. Coluna password pode ser removida manualmente após validação.';
END $$;

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 3
-- =====================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Verificar que todos os passwords foram migrados
-- 2. Testar funções de acesso
-- 3. Se tudo estiver OK, descomentar as linhas de DROP COLUMN acima
-- 4. Executar novamente para remover a coluna password
-- =====================================================








