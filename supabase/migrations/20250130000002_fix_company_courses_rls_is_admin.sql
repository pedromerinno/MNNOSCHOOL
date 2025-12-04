-- =====================================================
-- FIX: Corrigir políticas RLS de company_courses que
-- ainda referenciam profiles.is_admin (removida)
-- =====================================================
-- 
-- PROBLEMA: As políticas RLS de company_courses ainda
-- referenciam profiles.is_admin que foi removida, causando
-- erros 500 nas queries.
--
-- SOLUÇÃO: Atualizar todas as políticas para usar
-- user_empresa.is_admin em vez de profiles.is_admin
--
-- RISCO: BAIXO - Apenas corrige referências incorretas
-- IMPACTO: ALTO - Corrige erros 500 nas queries
-- =====================================================

-- =====================================================
-- 1. CORRIGIR POLÍTICA "Admins can manage company_courses"
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
CREATE POLICY "Admins can manage company_courses"
ON public.company_courses
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  -- Admin de empresa pode gerenciar cursos da sua empresa
  EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND ue.empresa_id = company_courses.empresa_id
  )
)
WITH CHECK (
  -- Mesma lógica para WITH CHECK
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND ue.empresa_id = company_courses.empresa_id
  )
);

-- =====================================================
-- 2. CORRIGIR POLÍTICA "Control course-company associations"
-- =====================================================

DROP POLICY IF EXISTS "Control course-company associations" ON public.company_courses;
CREATE POLICY "Control course-company associations"
ON public.company_courses
FOR ALL
USING (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND super_admin = true
    ) THEN true
    WHEN EXISTS (
      SELECT 1 FROM user_empresa
      WHERE user_id = (select auth.uid()) AND is_admin = true
      AND empresa_id = company_courses.empresa_id
    ) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND super_admin = true
    ) THEN true
    WHEN EXISTS (
      SELECT 1 FROM user_empresa
      WHERE user_id = (select auth.uid()) AND is_admin = true
      AND empresa_id = company_courses.empresa_id
    ) THEN true
    ELSE false
  END
);

-- =====================================================
-- 3. CORRIGIR POLÍTICA "Users can view company_courses they belong to or if admin"
-- =====================================================

DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;
CREATE POLICY "Users can view company_courses they belong to or if admin"
ON public.company_courses
FOR SELECT
USING (
  -- Usuário pode ver cursos da empresa que pertence
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_courses.empresa_id
  )
  OR
  -- Super admin pode ver tudo
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  -- Admin de empresa pode ver cursos da sua empresa
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) 
    AND is_admin = true
    AND empresa_id = company_courses.empresa_id
  )
);

-- =====================================================
-- 4. CORRIGIR POLÍTICA "Admins can manage lessons" (se ainda existir)
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
ON public.lessons
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  -- Admin de empresa pode gerenciar lições de cursos da sua empresa
  EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN company_courses cc ON cc.empresa_id = ue.empresa_id
    JOIN courses c ON c.id = cc.course_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND c.id = lessons.course_id
  )
)
WITH CHECK (
  -- Mesma lógica para WITH CHECK
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR
  EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN company_courses cc ON cc.empresa_id = ue.empresa_id
    JOIN courses c ON c.id = cc.course_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND c.id = lessons.course_id
  )
);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON POLICY "Admins can manage company_courses" ON public.company_courses IS 
'Política corrigida: Usa user_empresa.is_admin em vez de profiles.is_admin. Super admin ou admin de empresa podem gerenciar cursos.';

COMMENT ON POLICY "Control course-company associations" ON public.company_courses IS 
'Política corrigida: Usa user_empresa.is_admin em vez de profiles.is_admin. Controla associações curso-empresa.';

COMMENT ON POLICY "Users can view company_courses they belong to or if admin" ON public.company_courses IS 
'Política corrigida: Usa user_empresa.is_admin em vez de profiles.is_admin. Usuários veem cursos da empresa ou se forem admin.';

COMMENT ON POLICY "Admins can manage lessons" ON public.lessons IS 
'Política corrigida: Usa user_empresa.is_admin em vez de profiles.is_admin. Admins gerenciam lições de cursos da empresa.';




