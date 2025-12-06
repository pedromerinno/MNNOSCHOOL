-- =====================================================
-- CORREÇÃO: Melhorar verificação de permissão em get_company_users
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A função get_company_users pode estar retornando vazio mesmo quando há usuários
-- devido a problemas na verificação de permissão
--
-- SOLUÇÃO:
-- Melhorar a lógica de verificação de permissão para garantir que funcione corretamente
-- Adicionar verificação mais robusta
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_company_users(_empresa_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  avatar text,
  super_admin boolean,
  created_at timestamptz,
  aniversario date,
  cidade text,
  is_admin boolean,
  cargo_id uuid,
  cargo_title text,
  tipo_contrato text,
  data_inicio date,
  manual_cultura_aceito boolean,
  nivel_colaborador text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  has_permission boolean := false;
  is_super_admin boolean := false;
  is_company_admin boolean := false;
  is_company_member boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificações iniciais
  IF current_user_id IS NULL THEN
    RAISE WARNING 'get_company_users: current_user_id is NULL';
    RETURN;
  END IF;
  
  IF _empresa_id IS NULL THEN
    RAISE WARNING 'get_company_users: _empresa_id is NULL';
    RETURN;
  END IF;
  
  -- 1. Verificar se é super admin (mais rápido com índice)
  SELECT COALESCE(super_admin, false) INTO is_super_admin
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  -- Se for super admin, já tem permissão
  IF is_super_admin THEN
    has_permission := true;
  ELSE
    -- 2. Verificar se é admin da empresa específica
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id
      AND empresa_id = _empresa_id
      AND is_admin = true
      LIMIT 1
    ) INTO is_company_admin;
    
    IF is_company_admin THEN
      has_permission := true;
    ELSE
      -- 3. Verificar se é membro da empresa (pode ver outros membros)
      SELECT EXISTS (
        SELECT 1 FROM public.user_empresa
        WHERE user_id = current_user_id
        AND empresa_id = _empresa_id
        LIMIT 1
      ) INTO is_company_member;
      
      IF is_company_member THEN
        has_permission := true;
      END IF;
    END IF;
  END IF;
  
  -- Se não tem permissão, retornar vazio
  IF NOT has_permission THEN
    RAISE WARNING 'get_company_users: User % does not have permission to view users of company %', current_user_id, _empresa_id;
    RETURN;
  END IF;
  
  -- Retornar usuários da empresa
  -- Como esta função é SECURITY DEFINER, ela bypassa RLS
  -- então pode consultar profiles e user_empresa diretamente
  -- Os índices criados otimizam esta query
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.email,
    p.avatar,
    p.super_admin,
    p.created_at,
    p.aniversario,
    p.cidade,
    ue.is_admin,
    ue.cargo_id,
    COALESCE(jr.title, '') as cargo_title,
    ue.tipo_contrato,
    ue.data_inicio,
    ue.manual_cultura_aceito,
    ue.nivel_colaborador
  FROM public.profiles p
  INNER JOIN public.user_empresa ue ON p.id = ue.user_id
  LEFT JOIN public.job_roles jr ON ue.cargo_id = jr.id
  WHERE ue.empresa_id = _empresa_id
  ORDER BY p.display_name ASC;
END;
$$;

COMMENT ON FUNCTION public.get_company_users(uuid) IS 
'Função otimizada que retorna usuários de uma empresa. Verificação de permissão melhorada com logs de debug. Usa SECURITY DEFINER para bypassar RLS.';








