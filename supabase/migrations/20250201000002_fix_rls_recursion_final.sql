-- =====================================================
-- CORREÇÃO CRÍTICA: Erros 500 por Recursão RLS
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- As políticas RLS estão causando recursão infinita:
-- 1. profiles_select consulta profiles para verificar super_admin
-- 2. Isso cria um loop: para ler profiles, precisa ler profiles
-- 3. Resultado: Erro 500 no Supabase
--
-- SOLUÇÃO:
-- Usar funções SECURITY DEFINER que bypassam RLS temporariamente
-- para verificar permissões sem causar recursão
-- =====================================================

-- =====================================================
-- 1. REMOVER FUNÇÕES EXISTENTES (se houver)
-- =====================================================

DROP FUNCTION IF EXISTS public.check_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_company_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_in_company(uuid) CASCADE;

-- =====================================================
-- 2. FUNÇÕES HELPER SECURITY DEFINER (bypassam RLS)
-- =====================================================

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
-- 3. CORRIGIR POLÍTICA DE PROFILES (CRÍTICO - causa erro 500)
-- =====================================================

-- Remover política que causa recursão
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_lightweight" ON public.profiles;

-- Criar política corrigida usando função SECURITY DEFINER
-- IMPORTANTE: A verificação de super_admin usa função para evitar recursão
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
-- 4. CORRIGIR POLÍTICA DE USER_EMPRESA
-- =====================================================

DROP POLICY IF EXISTS "user_empresa_select" ON public.user_empresa;
DROP POLICY IF EXISTS "user_empresa_select_lightweight" ON public.user_empresa;

CREATE POLICY "user_empresa_select"
ON public.user_empresa
FOR SELECT
USING (
  -- Próprio registro (verificação direta, sem recursão)
  user_id = auth.uid()
  OR
  -- Super admin vê tudo (usa função para evitar recursão)
  public.check_super_admin()
  OR
  -- Admin de empresa vê membros da empresa (usa função para evitar recursão)
  public.check_company_admin(empresa_id)
);

-- =====================================================
-- 5. CORRIGIR POLÍTICA DE COMPANY_COURSES
-- =====================================================

DROP POLICY IF EXISTS "company_courses_select" ON public.company_courses;

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

-- =====================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.check_super_admin() IS 
'Verifica se o usuário atual é super admin usando SECURITY DEFINER para evitar recursão RLS. CRÍTICO: Esta função bypassa RLS temporariamente.';

COMMENT ON FUNCTION public.check_company_admin(uuid) IS 
'Verifica se o usuário atual é admin de uma empresa específica usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON FUNCTION public.check_user_in_company(uuid) IS 
'Verifica se o usuário atual pertence a uma empresa usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON POLICY "profiles_select" ON public.profiles IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

COMMENT ON POLICY "user_empresa_select" ON public.user_empresa IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

COMMENT ON POLICY "company_courses_select" ON public.company_courses IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

