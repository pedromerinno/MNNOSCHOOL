-- =====================================================
-- OTIMIZAÇÃO DE POLÍTICAS RLS RESTANTES - FASE 4
-- Otimiza políticas que usam funções como is_admin()
-- =====================================================
-- 
-- Esta migração otimiza políticas RLS que ainda usam
-- funções que reavaliam auth.uid() para cada linha,
-- substituindo-as por expressões diretas otimizadas.
--
-- RISCO: BAIXO - Apenas otimiza avaliação, não muda lógica
-- IMPACTO: MÉDIO - Melhora performance de queries com muitas linhas
-- =====================================================

-- =====================================================
-- EMPRESAS - Otimizar políticas que usam is_admin()
-- =====================================================

-- Otimizar: Allow admins to update empresas
DROP POLICY IF EXISTS "Allow admins to update empresas" ON public.empresas;
CREATE POLICY "Allow admins to update empresas"
ON public.empresas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- Otimizar: Allow admins to delete empresas
DROP POLICY IF EXISTS "Allow admins to delete empresas" ON public.empresas;
CREATE POLICY "Allow admins to delete empresas"
ON public.empresas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- COMPANY_VIDEOS - Otimizar políticas que usam is_admin()
-- =====================================================

-- Otimizar: Only admins can modify company videos
DROP POLICY IF EXISTS "Only admins can modify company videos" ON public.company_videos;
CREATE POLICY "Only admins can modify company videos"
ON public.company_videos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- JOB_ROLES - Otimizar políticas que usam is_admin()
-- =====================================================

-- Otimizar: Allow admins to manage job_roles
DROP POLICY IF EXISTS "Allow admins to manage job_roles" ON public.job_roles;
CREATE POLICY "Allow admins to manage job_roles"
ON public.job_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- Otimizar: Admins can manage job roles
DROP POLICY IF EXISTS "Admins can manage job roles" ON public.job_roles;
CREATE POLICY "Admins can manage job roles"
ON public.job_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Users can view job roles for their companies
DROP POLICY IF EXISTS "Users can view job roles for their companies" ON public.job_roles;
CREATE POLICY "Users can view job roles for their companies"
ON public.job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.empresa_id = job_roles.company_id
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- =====================================================
-- PROFILES - Otimizar políticas que usam funções
-- =====================================================

-- Otimizar: Admins can update profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Admins see users from their companies
-- Esta é mais complexa, mas vamos otimizar o auth.uid() dentro
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;
CREATE POLICY "Admins see users from their companies"
ON public.profiles
FOR SELECT
USING (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND super_admin = true
    ) THEN true
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    ) THEN (
      EXISTS (
        SELECT 1 FROM user_empresa ue1
        WHERE ue1.user_id = profiles.id
        AND EXISTS (
          SELECT 1 FROM user_empresa ue2
          WHERE ue2.user_id = (select auth.uid())
          AND ue2.empresa_id = ue1.empresa_id
        )
      )
      OR (profiles.id = (select auth.uid()))
    )
    ELSE (profiles.id = (select auth.uid()))
  END
);

-- =====================================================
-- USER_EMPRESA - Otimizar políticas que usam funções
-- =====================================================

-- Otimizar: Admins can manage memberships for their companies
DROP POLICY IF EXISTS "Admins can manage memberships for their companies" ON public.user_empresa;
CREATE POLICY "Admins can manage memberships for their companies"
ON public.user_empresa
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
  AND EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.empresa_id = user_empresa.empresa_id
    AND ue.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
  AND EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.empresa_id = user_empresa.empresa_id
    AND ue.is_admin = true
  )
);

-- Otimizar: Admins can view memberships for their companies
DROP POLICY IF EXISTS "Admins can view memberships for their companies" ON public.user_empresa;
CREATE POLICY "Admins can view memberships for their companies"
ON public.user_empresa
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
  AND EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.empresa_id = user_empresa.empresa_id
    AND ue.is_admin = true
  )
);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

