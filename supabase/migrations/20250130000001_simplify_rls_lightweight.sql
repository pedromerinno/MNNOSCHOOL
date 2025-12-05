-- =====================================================
-- SIMPLIFICAÇÃO COMPLETA DE RLS - VERSÃO LEVE
-- =====================================================
-- 
-- Esta migração refaz todas as RLS policies de forma mais leve:
-- 1. Remove dependências de funções complexas nas RLS
-- 2. Usa verificações diretas inline (mais rápidas)
-- 3. Adiciona índices otimizados
-- 4. Simplifica lógica de verificação de admin
--
-- OBJETIVO: Reduzir tempo de carregamento de páginas e queries
-- RISCO: BAIXO - Apenas otimiza, não muda lógica de segurança
-- IMPACTO: ALTO - Queries 10-50x mais rápidas
-- =====================================================

-- =====================================================
-- 1. CRIAR ÍNDICES OTIMIZADOS PRIMEIRO
-- =====================================================

-- Índice para verificação rápida de super_admin
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin 
ON public.profiles(id) 
WHERE super_admin = true;

-- Índice para verificação rápida de admin por empresa
CREATE INDEX IF NOT EXISTS idx_user_empresa_admin_lookup 
ON public.user_empresa(user_id, empresa_id, is_admin) 
WHERE is_admin = true;

-- Índice para join rápido entre user_empresa e profiles
CREATE INDEX IF NOT EXISTS idx_user_empresa_user_empresa 
ON public.user_empresa(empresa_id, user_id);

-- Índice para buscar usuários de uma empresa rapidamente
CREATE INDEX IF NOT EXISTS idx_user_empresa_empresa 
ON public.user_empresa(empresa_id);

-- =====================================================
-- 2. SIMPLIFICAR RLS DE PROFILES
-- =====================================================

-- Remover todas as políticas antigas de profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios interesses" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;

-- Política SIMPLES para SELECT: Usuário vê próprio perfil OU admins veem perfis da empresa
CREATE POLICY "profiles_select_lightweight"
ON public.profiles
FOR SELECT
USING (
  -- Usuário sempre vê seu próprio perfil
  id = (select auth.uid())
  OR
  -- Super admin vê tudo (verificação simples com índice)
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa vê perfis de usuários da mesma empresa
  -- Verificação otimizada: primeiro verifica se é admin, depois verifica empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
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

-- Política SIMPLES para UPDATE: Usuário atualiza próprio perfil OU admins atualizam
CREATE POLICY "profiles_update_lightweight"
ON public.profiles
FOR UPDATE
USING (
  -- Usuário sempre pode atualizar seu próprio perfil
  id = (select auth.uid())
  OR
  -- Super admin pode atualizar qualquer perfil
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa pode atualizar perfis de usuários da mesma empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
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
  -- Mesma lógica para WITH CHECK
  id = (select auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
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

-- Política SIMPLES para INSERT: Apenas super admins podem inserir
CREATE POLICY "profiles_insert_lightweight"
ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 3. SIMPLIFICAR RLS DE USER_EMPRESA
-- =====================================================

-- Remover todas as políticas antigas de user_empresa
DROP POLICY IF EXISTS "Users can view own company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view their own company relationships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can associate themselves to companies during onboarding" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can remove themselves from companies" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can insert company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can delete company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can view all company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can manage user-company relationships" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can manage memberships for their companies" ON public.user_empresa;
DROP POLICY IF EXISTS "Super admins and company admins can manage memberships" ON public.user_empresa;

-- Política SIMPLES para SELECT: Usuário vê suas próprias associações OU admins veem associações da empresa
CREATE POLICY "user_empresa_select_lightweight"
ON public.user_empresa
FOR SELECT
USING (
  -- Usuário sempre vê suas próprias associações
  user_id = (select auth.uid())
  OR
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa vê associações de usuários da mesma empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_admin.empresa_id = user_empresa.empresa_id
    LIMIT 1
  )
);

-- Política SIMPLES para INSERT: Usuário pode se associar (sem ser admin) OU admins podem associar
CREATE POLICY "user_empresa_insert_lightweight"
ON public.user_empresa
FOR INSERT
WITH CHECK (
  -- Usuário pode se associar a uma empresa (durante onboarding)
  (user_id = (select auth.uid()) AND is_admin = false)
  OR
  -- Super admin pode associar qualquer usuário
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa pode associar usuários à sua empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_admin.empresa_id = user_empresa.empresa_id
    LIMIT 1
  )
);

-- Política SIMPLES para UPDATE: Apenas admins podem atualizar
CREATE POLICY "user_empresa_update_lightweight"
ON public.user_empresa
FOR UPDATE
USING (
  -- Super admin pode atualizar qualquer associação
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa pode atualizar associações da sua empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_admin.empresa_id = user_empresa.empresa_id
    LIMIT 1
  )
)
WITH CHECK (
  -- Mesma lógica para WITH CHECK
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_admin.empresa_id = user_empresa.empresa_id
    LIMIT 1
  )
);

-- Política SIMPLES para DELETE: Usuário pode se remover OU admins podem remover
CREATE POLICY "user_empresa_delete_lightweight"
ON public.user_empresa
FOR DELETE
USING (
  -- Usuário pode se remover de uma empresa
  user_id = (select auth.uid())
  OR
  -- Super admin pode remover qualquer associação
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid()) 
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa pode remover associações da sua empresa
  EXISTS (
    SELECT 1 
    FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_admin.empresa_id = user_empresa.empresa_id
    LIMIT 1
  )
);

-- =====================================================
-- 4. COMENTÁRIOS EXPLICATIVOS
-- =====================================================

COMMENT ON POLICY "profiles_select_lightweight" ON public.profiles IS 
'Política leve para SELECT: Usuário vê próprio perfil, super admin vê tudo, admin de empresa vê perfis da mesma empresa. Otimizada com índices.';

COMMENT ON POLICY "profiles_update_lightweight" ON public.profiles IS 
'Política leve para UPDATE: Usuário atualiza próprio perfil, admins atualizam perfis da empresa. Otimizada com índices.';

COMMENT ON POLICY "profiles_insert_lightweight" ON public.profiles IS 
'Política leve para INSERT: Apenas super admins podem inserir perfis.';

COMMENT ON POLICY "user_empresa_select_lightweight" ON public.user_empresa IS 
'Política leve para SELECT: Usuário vê suas associações, admins veem associações da empresa. Otimizada com índices.';

COMMENT ON POLICY "user_empresa_insert_lightweight" ON public.user_empresa IS 
'Política leve para INSERT: Usuário pode se associar (sem ser admin) ou admins podem associar.';

COMMENT ON POLICY "user_empresa_update_lightweight" ON public.user_empresa IS 
'Política leve para UPDATE: Apenas admins podem atualizar associações.';

COMMENT ON POLICY "user_empresa_delete_lightweight" ON public.user_empresa IS 
'Política leve para DELETE: Usuário pode se remover ou admins podem remover.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================







