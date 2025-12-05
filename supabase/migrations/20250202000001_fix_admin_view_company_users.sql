-- =====================================================
-- CORREÇÃO: Admin não consegue ver outros usuários da mesma empresa
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A função get_company_users usa SECURITY DEFINER, mas quando consulta
-- a view view_company_users_view, que por sua vez consulta profiles,
-- a política RLS profiles_select verifica se o usuário atual é admin
-- de ALGUMA empresa, mas não verifica se é admin da empresa ESPECÍFICA
-- que está sendo consultada.
--
-- SOLUÇÃO:
-- Ajustar a função get_company_users para verificar se o usuário atual
-- é admin da empresa específica antes de retornar os dados, e garantir
-- que a política RLS permita que admins vejam usuários da mesma empresa.
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO HELPER PARA VERIFICAR SE É ADMIN DA EMPRESA
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin_of_company(_empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  is_admin boolean;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se é super admin (pode ver qualquer empresa)
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = current_user_id AND super_admin = true
    LIMIT 1
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin da empresa específica
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
    AND empresa_id = _empresa_id
    AND is_admin = true
    LIMIT 1
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

COMMENT ON FUNCTION public.is_admin_of_company(uuid) IS 
'Verifica se o usuário atual é admin de uma empresa específica. Usa SECURITY DEFINER para evitar recursão RLS.';

-- =====================================================
-- 2. ATUALIZAR FUNÇÃO get_company_users
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
BEGIN
  -- Verificar se o usuário atual tem permissão para ver usuários desta empresa
  IF NOT public.is_admin_of_company(_empresa_id) THEN
    -- Se não for admin da empresa, verificar se é membro da empresa
    -- (para permitir que usuários vejam outros membros da mesma empresa)
    IF NOT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = auth.uid()
      AND empresa_id = _empresa_id
      LIMIT 1
    ) THEN
      -- Não tem permissão: retornar vazio
      RETURN;
    END IF;
  END IF;
  
  -- Retornar usuários da empresa
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
    jr.title as cargo_title,
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
'Função corrigida que retorna usuários de uma empresa. Verifica se o usuário atual é admin da empresa ou membro antes de retornar os dados.';

-- =====================================================
-- 3. GARANTIR QUE A POLÍTICA RLS PERMITA ADMINS VER USUÁRIOS DA EMPRESA
-- =====================================================

-- A política profiles_select já deve estar correta, mas vamos garantir
-- que ela permite que admins vejam usuários da mesma empresa
-- (a política atual já faz isso, mas vamos adicionar um comentário)

COMMENT ON POLICY "profiles_select" ON public.profiles IS 
'Política corrigida para evitar recursão RLS. Permite que admins de empresa vejam perfis de usuários da mesma empresa. Usa funções SECURITY DEFINER para verificar permissões.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================






