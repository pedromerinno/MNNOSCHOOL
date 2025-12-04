-- =====================================================
-- MIGRAÇÃO: Desabilitar criptografia de senhas
-- =====================================================
-- 
-- Modifica todas as funções para usar senhas em texto plano
-- As senhas não serão mais criptografadas e aparecerão diretamente para o usuário
--
-- RISCO: MÉDIO - Altera comportamento de segurança
-- IMPACTO: ALTO - Senhas agora são armazenadas em texto plano
-- =====================================================

-- Function to insert company access with plain text password
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
BEGIN
  -- Validate required parameters
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id cannot be null';
  END IF;
  
  IF p_tool_name IS NULL OR p_tool_name = '' THEN
    RAISE EXCEPTION 'tool_name cannot be null or empty';
  END IF;
  
  IF p_username IS NULL OR p_username = '' THEN
    RAISE EXCEPTION 'username cannot be null or empty';
  END IF;
  
  IF p_password IS NULL OR p_password = '' THEN
    RAISE EXCEPTION 'password cannot be null or empty';
  END IF;

  -- Insert record with plain text password (no encryption)
  INSERT INTO public.company_access (
    company_id,
    tool_name,
    username,
    password,
    url,
    notes,
    created_by
  ) VALUES (
    p_company_id,
    p_tool_name,
    p_username,
    p_password,
    p_url,
    p_notes,
    auth.uid()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update company access with plain text password
CREATE OR REPLACE FUNCTION public.update_company_access(
  p_id UUID,
  p_tool_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update record with plain text password (no encryption)
  UPDATE public.company_access SET
    tool_name = COALESCE(p_tool_name, tool_name),
    username = COALESCE(p_username, username),
    password = COALESCE(p_password, password),
    url = COALESCE(p_url, url),
    notes = COALESCE(p_notes, notes)
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get company access with plain text password (admin only)
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
  current_user_id := auth.uid();
  
  -- Check authorization
  IF NOT (
    SELECT COALESCE(is_admin, false) OR COALESCE(super_admin, false) 
    FROM profiles 
    WHERE profiles.id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Return data with plain text password (no decryption needed)
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    ca.password as password_decrypted, -- Return password directly (plain text)
    ca.url,
    ca.notes,
    ca.created_at,
    ca.created_by
  FROM public.company_access ca
  WHERE ca.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get company access for regular users with plain text password
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
  
  -- Retornar acessos que o usuário pode ver com senha em texto plano
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    ca.password as password_decrypted, -- Return password directly (plain text)
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

-- Function to insert user access with plain text password
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
BEGIN
  -- Insert record with plain text password (no encryption)
  INSERT INTO public.user_access (
    user_id,
    tool_name,
    username,
    password,
    url,
    notes
  ) VALUES (
    auth.uid(),
    p_tool_name,
    p_username,
    p_password,
    p_url,
    p_notes
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get user access with plain text password (own data only)
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
  -- Return data with plain text password (no decryption needed)
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.tool_name,
    ua.username,
    ua.password as password_decrypted, -- Return password directly (plain text)
    ua.url,
    ua.notes,
    ua.created_at,
    ua.updated_at
  FROM public.user_access ua
  WHERE ua.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.create_company_access IS 'Cria um novo acesso da empresa com senha em texto plano (sem criptografia)';
COMMENT ON FUNCTION public.update_company_access IS 'Atualiza um acesso da empresa com senha em texto plano (sem criptografia)';
COMMENT ON FUNCTION public.get_company_access_decrypted IS 'Retorna os itens de acesso da empresa com senhas em texto plano. Requer que o usuário seja admin da empresa ou super admin.';
COMMENT ON FUNCTION public.get_company_access_for_user IS 'Retorna os itens de acesso da empresa que o usuário pode ver baseado em permissões, com senhas em texto plano.';
COMMENT ON FUNCTION public.create_user_access IS 'Cria um novo acesso pessoal do usuário com senha em texto plano (sem criptografia)';
COMMENT ON FUNCTION public.get_user_access_decrypted IS 'Retorna os itens de acesso pessoal do usuário com senhas em texto plano.';

