-- =====================================================
-- MIGRAÇÃO: Criar função para retornar acessos baseados em permissões do usuário
-- =====================================================
-- 
-- Cria função get_company_access_for_user que retorna acessos que o usuário pode ver:
-- - Acessos públicos (sem restrições)
-- - Acessos relacionados ao cargo do usuário na empresa
-- - Acessos com permissão específica para o usuário
--
-- RISCO: BAIXO - Apenas adiciona nova função
-- IMPACTO: ALTO - Permite que usuários vejam acessos baseados em permissões
-- =====================================================

-- Function to get company access for regular users (filtered by permissions)
CREATE OR REPLACE FUNCTION public.get_company_access_for_user(p_company_id UUID)
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
  user_belongs_to_company BOOLEAN := false;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar se usuário está autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  -- Verificar se usuário pertence à empresa
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
      AND empresa_id = p_company_id
  ) INTO user_belongs_to_company;
  
  -- Se não pertence à empresa e não é super admin, não pode ver nada
  IF NOT user_belongs_to_company AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = current_user_id AND super_admin = true
  ) THEN
    RETURN;
  END IF;
  
  -- Retornar acessos que o usuário pode ver:
  -- 1. Acessos públicos (sem restrições de cargo nem de usuário)
  -- 2. Acessos com restrições de cargo onde o usuário tem aquele cargo na empresa
  -- 3. Acessos com permissão específica para o usuário
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    CASE 
      WHEN ca.password_encrypted IS NOT NULL AND ca.encryption_key IS NOT NULL THEN
        public.decrypt_password(ca.password_encrypted, ca.encryption_key)
      ELSE ca.password -- Fallback to plaintext temporarily
    END as password_decrypted,
    ca.url,
    ca.notes,
    ca.created_at,
    ca.created_by
  FROM public.company_access ca
  WHERE ca.company_id = p_company_id
    AND (
      -- Acesso público: não tem restrições de cargo nem de usuário
      (
        NOT EXISTS (
          SELECT 1 FROM public.company_access_job_roles cajr
          WHERE cajr.company_access_id = ca.id
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.company_access_users cau
          WHERE cau.company_access_id = ca.id
        )
      )
      OR
      -- Usuário tem o cargo necessário na empresa
      EXISTS (
        SELECT 1 FROM public.company_access_job_roles cajr
        JOIN public.user_empresa ue ON (
          ue.user_id = current_user_id
          AND ue.empresa_id = p_company_id
          AND ue.cargo_id = cajr.job_role_id
        )
        WHERE cajr.company_access_id = ca.id
      )
      OR
      -- Usuário tem permissão específica
      EXISTS (
        SELECT 1 FROM public.company_access_users cau
        WHERE cau.company_access_id = ca.id
          AND cau.user_id = current_user_id
      )
      OR
      -- Super admin pode ver tudo
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = current_user_id AND super_admin = true
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_company_access_for_user IS 'Retorna os itens de acesso da empresa que o usuário pode ver baseado em permissões: acessos públicos, relacionados ao cargo do usuário, ou com permissão específica. Descriptografa as senhas automaticamente.';






