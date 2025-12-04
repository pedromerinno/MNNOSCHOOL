-- =====================================================
-- OTIMIZAR POLÍTICA RLS DE PROFILES PARA ADMINS DE EMPRESA
-- =====================================================
-- 
-- Problema: A política atual "Admins see users from their companies" 
-- está causando timeout porque verifica para cada linha se o usuário
-- é admin e se cada perfil pertence à mesma empresa.
--
-- Solução: Criar política mais eficiente que permite que admins vejam
-- TODOS os perfis de usuários que estão na mesma empresa, usando
-- uma verificação mais simples e direta.
-- =====================================================

-- Remover política antiga que está causando problemas de performance
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;

-- Criar política otimizada para admins verem usuários da empresa
-- Esta política é mais eficiente porque:
-- 1. Verifica se o usuário é admin de alguma empresa (uma vez)
-- 2. Permite ver perfis de usuários que estão na mesma empresa
-- 3. Usa uma subquery mais eficiente com JOIN implícito
CREATE POLICY "Admins see users from their companies"
ON public.profiles
FOR SELECT
USING (
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  -- Admin de empresa vê todos os perfis de usuários que estão na mesma empresa
  -- Esta query é otimizada: primeiro verifica se é admin, depois verifica se o perfil
  -- pertence à mesma empresa usando um JOIN implícito mais eficiente
  EXISTS (
    SELECT 1 
    FROM user_empresa ue_admin
    INNER JOIN user_empresa ue_user ON ue_admin.empresa_id = ue_user.empresa_id
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND ue_user.user_id = profiles.id
  )
  OR
  -- Usuário sempre pode ver seu próprio perfil
  profiles.id = (select auth.uid())
);

-- Criar índice para melhorar performance da verificação de admin
-- Isso acelera a verificação de is_admin = true
CREATE INDEX IF NOT EXISTS idx_user_empresa_admin 
ON public.user_empresa(user_id, is_admin) 
WHERE is_admin = true;

-- Criar índice para melhorar join entre user_empresa e profiles
CREATE INDEX IF NOT EXISTS idx_user_empresa_empresa_user 
ON public.user_empresa(empresa_id, user_id);

-- Comentário explicativo
COMMENT ON POLICY "Admins see users from their companies" ON public.profiles IS 
'Permite que administradores de empresa vejam todos os perfis de usuários que estão na mesma empresa. Otimizada para evitar timeouts.';

