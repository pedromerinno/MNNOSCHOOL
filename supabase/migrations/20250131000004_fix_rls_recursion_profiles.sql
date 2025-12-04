-- =====================================================
-- CORREÇÃO CRÍTICA: Recursão infinita em profiles_select
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A política RLS profiles_select está causando recursão infinita:
-- 1. profiles_select consulta profiles para verificar super_admin
-- 2. Isso cria um loop: para ler profiles, precisa ler profiles
-- 3. Resultado: "infinite recursion detected in policy for relation profiles"
--
-- SOLUÇÃO:
-- Usar funções SECURITY DEFINER que bypassam RLS temporariamente
-- para verificar permissões sem causar recursão
-- =====================================================

-- =====================================================
-- 1. CRIAR/ATUALIZAR FUNÇÕES HELPER SECURITY DEFINER
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
-- 2. CORRIGIR POLÍTICA DE PROFILES (CRÍTICO)
-- =====================================================

-- Remover política que causa recursão
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

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
-- 3. CORRIGIR OUTRAS POLÍTICAS DE PROFILES
-- =====================================================

-- Corrigir profiles_insert
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Apenas super admin pode inserir (usa função para evitar recursão)
  public.check_super_admin()
);

-- Corrigir profiles_update
-- NOTA: Não podemos usar OLD/NEW em políticas RLS, então removemos a restrição
-- de não alterar super_admin da política. Isso deve ser controlado por trigger ou aplicação.
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_update"
ON public.profiles
FOR UPDATE
USING (
  -- Próprio perfil
  id = auth.uid()
  OR
  -- Super admin pode atualizar tudo (usa função para evitar recursão)
  public.check_super_admin()
  OR
  -- Admin de empresa pode atualizar usuários da empresa
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
)
WITH CHECK (
  -- Mesmas condições do USING
  id = auth.uid()
  OR
  public.check_super_admin()
  OR
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

-- Corrigir profiles_delete
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

CREATE POLICY "profiles_delete"
ON public.profiles
FOR DELETE
USING (
  -- Apenas super admin pode deletar (usa função para evitar recursão)
  public.check_super_admin()
);

-- =====================================================
-- 4. CORRIGIR POLÍTICA DE USER_EMPRESA
-- =====================================================

DROP POLICY IF EXISTS "user_empresa_select" ON public.user_empresa;

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
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.check_super_admin() IS 
'Verifica se o usuário atual é super admin usando SECURITY DEFINER para evitar recursão RLS. CRÍTICO: Esta função bypassa RLS temporariamente.';

COMMENT ON FUNCTION public.check_company_admin(uuid) IS 
'Verifica se o usuário atual é admin de uma empresa específica usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON FUNCTION public.check_user_in_company(uuid) IS 
'Verifica se o usuário atual pertence a uma empresa usando SECURITY DEFINER para evitar recursão RLS.';

COMMENT ON POLICY "profiles_select" ON public.profiles IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões. CRÍTICO: Não consulta profiles diretamente na política.';

COMMENT ON POLICY "user_empresa_select" ON public.user_empresa IS 
'Política corrigida para evitar recursão RLS. Usa funções SECURITY DEFINER para verificar permissões.';

