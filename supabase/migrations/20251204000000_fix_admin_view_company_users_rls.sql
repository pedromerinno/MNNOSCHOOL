-- =====================================================
-- CORREÇÃO: Admin não consegue ver usuários da empresa
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A função is_admin_of_company está consultando user_empresa,
-- mas mesmo sendo SECURITY DEFINER, pode estar sendo bloqueada
-- pelas políticas RLS quando um admin (não super admin) tenta
-- verificar se é admin de uma empresa.
--
-- SOLUÇÃO:
-- Garantir que a função is_admin_of_company consulte user_empresa
-- de forma que bypassa RLS corretamente, e também garantir que
-- a função get_company_users funcione corretamente para admins.
-- =====================================================

-- =====================================================
-- 1. CORRIGIR FUNÇÃO user_is_company_admin
-- =====================================================
-- A função user_is_company_admin já existe e é usada nas políticas RLS.
-- O problema é que ela não verifica se o usuário é super admin antes
-- de verificar se é admin da empresa. Vamos corrigir isso.

CREATE OR REPLACE FUNCTION public.user_is_company_admin(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  is_super_admin_val boolean := false;
  is_admin_val boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se é super admin (pode ver qualquer empresa)
  -- Usar consulta direta com SECURITY DEFINER para bypassar RLS
  SELECT COALESCE(super_admin, false) INTO is_super_admin_val
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  IF is_super_admin_val THEN
    RETURN true;
  END IF;
  
  -- Se company_id for NULL, super admin já retornou true acima
  -- Para não-super-admins, precisamos de um company_id válido
  IF company_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se é admin da empresa específica
  -- Como esta função é SECURITY DEFINER, ela bypassa RLS
  -- então pode consultar user_empresa diretamente
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
    AND empresa_id = company_id
    AND is_admin = true
    LIMIT 1
  ) INTO is_admin_val;
  
  RETURN COALESCE(is_admin_val, false);
END;
$$;

COMMENT ON FUNCTION public.user_is_company_admin(uuid) IS 
'Verifica se o usuário atual é admin de uma empresa específica. Usa SECURITY DEFINER para bypassar RLS e evitar recursão. Super admins sempre retornam true para qualquer empresa.';

-- =====================================================
-- 2. CORRIGIR FUNÇÃO is_admin_of_company PARA USAR user_is_company_admin
-- =====================================================
-- A função is_admin_of_company pode usar user_is_company_admin
-- para manter consistência

CREATE OR REPLACE FUNCTION public.is_admin_of_company(_empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.user_is_company_admin(_empresa_id);
END;
$$;

COMMENT ON FUNCTION public.is_admin_of_company(uuid) IS 
'Wrapper para user_is_company_admin. Verifica se o usuário atual é admin de uma empresa específica.';

-- =====================================================
-- 2. GARANTIR QUE get_company_users FUNCIONE PARA ADMINS
-- =====================================================
-- A função já está correta, mas vamos garantir que ela
-- use a função is_admin_of_company corretamente

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
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Verificar se o usuário atual tem permissão para ver usuários desta empresa
  -- Usar a função user_is_company_admin que bypassa RLS
  has_permission := public.user_is_company_admin(_empresa_id);
  
  -- Se não for admin da empresa, verificar se é membro da empresa
  -- (para permitir que usuários vejam outros membros da mesma empresa)
  IF NOT has_permission THEN
    -- Como esta função é SECURITY DEFINER, pode consultar user_empresa diretamente
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id
      AND empresa_id = _empresa_id
      LIMIT 1
    ) INTO has_permission;
  END IF;
  
  -- Se não tem permissão, retornar vazio
  IF NOT has_permission THEN
    RETURN;
  END IF;
  
  -- Retornar usuários da empresa
  -- Como esta função é SECURITY DEFINER, ela bypassa RLS
  -- então pode consultar profiles e user_empresa diretamente
  -- IMPORTANTE: Qualificar TODAS as colunas para evitar ambiguidade
  -- Especialmente is_admin que existe em user_empresa
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
    ue.is_admin,  -- Qualificado com alias ue para evitar ambiguidade
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
'Função que retorna usuários de uma empresa. Verifica se o usuário atual é admin da empresa ou membro antes de retornar os dados. Usa SECURITY DEFINER para bypassar RLS.';

-- =====================================================
-- 3. CRIAR/ATUALIZAR POLÍTICA RLS PARA ADMINS VEREM USUÁRIOS DA EMPRESA
-- =====================================================
-- A política RLS "Admins see users from their companies" precisa existir
-- e estar correta para que admins possam ver usuários da empresa.
-- Vamos garantir que ela existe e que todas as referências estejam qualificadas.

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;

-- Criar política otimizada para admins verem usuários da empresa
-- IMPORTANTE: Todas as referências a is_admin estão qualificadas com alias
-- (ue_admin.is_admin) para evitar ambiguidade
CREATE POLICY "Admins see users from their companies"
ON public.profiles
FOR SELECT
USING (
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de empresa vê todos os perfis de usuários que estão na mesma empresa
  -- IMPORTANTE: Todas as referências a is_admin estão qualificadas
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    INNER JOIN public.user_empresa ue_user ON ue_admin.empresa_id = ue_user.empresa_id
    WHERE ue_admin.user_id = auth.uid()
    AND ue_admin.is_admin = true  -- Qualificado com alias
    AND ue_user.user_id = profiles.id
  )
  OR
  -- Usuário sempre pode ver seu próprio perfil
  profiles.id = auth.uid()
);

-- Comentário explicativo
COMMENT ON POLICY "Admins see users from their companies" ON public.profiles IS 
'Permite que administradores de empresa vejam todos os perfis de usuários que estão na mesma empresa. IMPORTANTE: Todas as referências a is_admin estão qualificadas com o alias da tabela (ue_admin.is_admin) para evitar ambiguidade.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

