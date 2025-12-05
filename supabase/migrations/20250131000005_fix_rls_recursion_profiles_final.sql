-- =====================================================
-- CORREÇÃO FINAL: Recursão RLS em Profiles e Tabelas Relacionadas
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A política "Admins see users from their companies" na migração
-- 20251203014206_optimize_profiles_rls_for_company_admins.sql
-- faz SELECT FROM profiles dentro de uma política RLS de profiles,
-- causando recursão infinita (erro 42P17).
--
-- Outras políticas também consultam profiles dentro de políticas RLS,
-- causando o mesmo problema.
--
-- SOLUÇÃO:
-- Usar funções SECURITY DEFINER que bypassam RLS temporariamente
-- para verificar permissões sem causar recursão.
-- =====================================================

-- =====================================================
-- 1. GARANTIR QUE FUNÇÕES HELPER EXISTAM
-- =====================================================
-- As funções já devem existir de migrações anteriores,
-- mas vamos garantir que estejam corretas

-- Verificar se usuário atual é super admin (sem recursão)
CREATE OR REPLACE FUNCTION public.check_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  is_super boolean;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Usar SECURITY DEFINER para bypassar RLS e verificar diretamente
  SELECT super_admin INTO is_super
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  RETURN COALESCE(is_super, false);
END;
$$;

-- Verificar se usuário atual é admin de uma empresa
CREATE OR REPLACE FUNCTION public.check_company_admin(_empresa_id uuid)
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
  
  -- Verificar se é admin da empresa (bypassa RLS)
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

-- Verificar se usuário pertence a uma empresa
CREATE OR REPLACE FUNCTION public.check_user_in_company(_empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  belongs boolean;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se pertence à empresa (bypassa RLS)
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
    AND empresa_id = _empresa_id
    LIMIT 1
  ) INTO belongs;
  
  RETURN COALESCE(belongs, false);
END;
$$;

-- =====================================================
-- 2. CORRIGIR POLÍTICA "Admins see users from their companies"
-- =====================================================
-- Esta política causa recursão porque faz SELECT FROM profiles
-- dentro de uma política RLS de profiles

DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;

-- Criar política corrigida usando função SECURITY DEFINER
CREATE POLICY "Admins see users from their companies"
ON public.profiles
FOR SELECT
USING (
  -- Caso 1: Próprio perfil (sempre pode ver) - verificação direta, sem recursão
  profiles.id = auth.uid()
  OR
  -- Caso 2: Super admin vê tudo (usa função SECURITY DEFINER para evitar recursão)
  public.check_super_admin()
  OR
  -- Caso 3: Admin de empresa vê perfis de usuários da mesma empresa
  -- Usa verificação direta de user_empresa (não consulta profiles, então não há recursão)
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = auth.uid()
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM public.user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
);

-- =====================================================
-- 3. CORRIGIR POLÍTICA "profiles_select" SE EXISTIR
-- =====================================================

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
USING (
  -- Caso 1: Próprio perfil (sempre pode ver) - verificação direta, sem recursão
  id = auth.uid()
  OR
  -- Caso 2: Super admin vê tudo (usa função SECURITY DEFINER para evitar recursão)
  public.check_super_admin()
  OR
  -- Caso 3: Admin de empresa vê perfis de usuários da mesma empresa
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = auth.uid()
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM public.user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
);

-- =====================================================
-- 4. CORRIGIR POLÍTICAS DE COMPANY_COURSES
-- =====================================================
-- Remover políticas que consultam profiles diretamente

DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;
DROP POLICY IF EXISTS "company_courses_select" ON public.company_courses;

-- Criar política SELECT corrigida
CREATE POLICY "company_courses_select"
ON public.company_courses
FOR SELECT
USING (
  -- Super admin vê tudo (usa função para evitar recursão)
  public.check_super_admin()
  OR
  -- Usuário da empresa pode ver (usa função para evitar recursão)
  public.check_user_in_company(empresa_id)
);

-- Criar política para admins gerenciarem (ALL)
CREATE POLICY "Admins can manage company_courses"
ON public.company_courses
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  public.check_super_admin()
  OR
  -- Admin da empresa específica pode gerenciar
  public.check_company_admin(empresa_id)
)
WITH CHECK (
  -- Mesmas condições do USING
  public.check_super_admin()
  OR
  public.check_company_admin(empresa_id)
);

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.check_super_admin() IS 
'Verifica se o usuário atual é super admin usando SECURITY DEFINER para evitar recursão RLS. CRÍTICO: Esta função bypassa RLS temporariamente.';

COMMENT ON FUNCTION public.check_company_admin(uuid) IS 
'Verifica se o usuário atual é admin de uma empresa específica usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON FUNCTION public.check_user_in_company(uuid) IS 
'Verifica se o usuário atual pertence a uma empresa usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON POLICY "Admins see users from their companies" ON public.profiles IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões. CRÍTICO: Não consulta profiles diretamente na política.';

COMMENT ON POLICY "profiles_select" ON public.profiles IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

COMMENT ON POLICY "company_courses_select" ON public.company_courses IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

COMMENT ON POLICY "Admins can manage company_courses" ON public.company_courses IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';






