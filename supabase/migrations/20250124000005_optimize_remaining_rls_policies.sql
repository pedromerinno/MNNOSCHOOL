-- =====================================================
-- OTIMIZAÇÃO DE POLÍTICAS RLS RESTANTES - FASE 6
-- Otimiza políticas que ainda usam auth.uid() diretamente
-- =====================================================

-- =====================================================
-- EMPRESAS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admin or super admin can see companies
DROP POLICY IF EXISTS "Admin or super admin can see companies" ON public.empresas;
CREATE POLICY "Admin or super admin can see companies"
ON public.empresas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa
    WHERE empresa_id = empresas.id AND user_id = (select auth.uid())
  )
);

-- Otimizar: Admins can delete companies
DROP POLICY IF EXISTS "Admins can delete companies" ON public.empresas;
CREATE POLICY "Admins can delete companies"
ON public.empresas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- Otimizar: Admins can update companies
DROP POLICY IF EXISTS "Admins can update companies" ON public.empresas;
CREATE POLICY "Admins can update companies"
ON public.empresas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- Otimizar: Regular admins can manage their companies
DROP POLICY IF EXISTS "Regular admins can manage their companies" ON public.empresas;
CREATE POLICY "Regular admins can manage their companies"
ON public.empresas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
  AND EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = empresas.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
  AND EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = empresas.id
  )
);

-- Otimizar: Super admins can see all companies
DROP POLICY IF EXISTS "Super admins can see all companies" ON public.empresas;
CREATE POLICY "Super admins can see all companies"
ON public.empresas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
);

-- Otimizar: Users can view companies they belong to
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.empresas;
CREATE POLICY "Users can view companies they belong to"
ON public.empresas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = empresas.id
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- COURSES - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admin or super admin can see all courses
DROP POLICY IF EXISTS "Admin or super admin can see all courses" ON public.courses;
CREATE POLICY "Admin or super admin can see all courses"
ON public.courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
  OR EXISTS (
    SELECT 1 FROM company_courses cc
    JOIN user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id AND ue.user_id = (select auth.uid())
  )
);

-- Otimizar: Admins can manage courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
ON public.courses
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

-- Otimizar: Users can view courses from their companies or if they are admi
DROP POLICY IF EXISTS "Users can view courses from their companies or if they are admi" ON public.courses;
CREATE POLICY "Users can view courses from their companies or if they are admi"
ON public.courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM company_courses cc
    JOIN user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id AND ue.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- COMPANY_COURSES - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admins can manage company_courses
DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
CREATE POLICY "Admins can manage company_courses"
ON public.company_courses
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

-- Otimizar: Control course-company associations
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
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    ) THEN EXISTS (
      SELECT 1 FROM user_empresa ue
      WHERE ue.empresa_id = company_courses.empresa_id AND ue.user_id = (select auth.uid())
    )
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
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    ) THEN EXISTS (
      SELECT 1 FROM user_empresa ue
      WHERE ue.empresa_id = company_courses.empresa_id AND ue.user_id = (select auth.uid())
    )
    ELSE false
  END
);

-- Otimizar: Users can view company_courses they belong to or if admin
DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;
CREATE POLICY "Users can view company_courses they belong to or if admin"
ON public.company_courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_courses.empresa_id
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- LESSONS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admins can manage lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
ON public.lessons
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
-- COMPANY_ACCESS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Administrators can manage all access data
DROP POLICY IF EXISTS "Administrators can manage all access data" ON public.company_access;
CREATE POLICY "Administrators can manage all access data"
ON public.company_access
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

-- Otimizar: Admins can delete company access
DROP POLICY IF EXISTS "Admins can delete company access" ON public.company_access;
CREATE POLICY "Admins can delete company access"
ON public.company_access
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_access.company_id AND is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Admins can update company access
DROP POLICY IF EXISTS "Admins can update company access" ON public.company_access;
CREATE POLICY "Admins can update company access"
ON public.company_access
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_access.company_id AND is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Users can view company access if related to company
DROP POLICY IF EXISTS "Users can view company access if related to company" ON public.company_access;
CREATE POLICY "Users can view company access if related to company"
ON public.company_access
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_access.company_id
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- Otimizar: Users can view company access where they belong
DROP POLICY IF EXISTS "Users can view company access where they belong" ON public.company_access;
CREATE POLICY "Users can view company access where they belong"
ON public.company_access
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_access.company_id
  )
);

-- =====================================================
-- COMPANY_DOCUMENTS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admins can delete company documents
DROP POLICY IF EXISTS "Admins can delete company documents" ON public.company_documents;
CREATE POLICY "Admins can delete company documents"
ON public.company_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_empresa ue ON p.id = ue.user_id
    WHERE p.id = (select auth.uid()) AND ue.empresa_id = company_documents.company_id AND (p.is_admin = true OR p.super_admin = true)
  )
);

-- Otimizar: Admins can update company documents
DROP POLICY IF EXISTS "Admins can update company documents" ON public.company_documents;
CREATE POLICY "Admins can update company documents"
ON public.company_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_empresa ue ON p.id = ue.user_id
    WHERE p.id = (select auth.uid()) AND ue.empresa_id = company_documents.company_id AND (p.is_admin = true OR p.super_admin = true)
  )
);

-- Otimizar: Users can view company documents from their companies
DROP POLICY IF EXISTS "Users can view company documents from their companies" ON public.company_documents;
CREATE POLICY "Users can view company documents from their companies"
ON public.company_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_documents.company_id
  )
);

-- =====================================================
-- COMPANY_NOTICES - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admins can delete company notices
DROP POLICY IF EXISTS "Admins can delete company notices" ON public.company_notices;
CREATE POLICY "Admins can delete company notices"
ON public.company_notices
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_notices.company_id AND is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Admins can update company notices
DROP POLICY IF EXISTS "Admins can update company notices" ON public.company_notices;
CREATE POLICY "Admins can update company notices"
ON public.company_notices
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_notices.company_id AND is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND (is_admin = true OR super_admin = true)
  )
);

-- Otimizar: Users can view company notices
DROP POLICY IF EXISTS "Users can view company notices" ON public.company_notices;
CREATE POLICY "Users can view company notices"
ON public.company_notices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = company_notices.company_id
  )
);

-- =====================================================
-- DISCUSSIONS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Users can view company discussions
DROP POLICY IF EXISTS "Users can view company discussions" ON public.discussions;
CREATE POLICY "Users can view company discussions"
ON public.discussions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND empresa_id = discussions.company_id
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- USER_DOCUMENTS - Otimizar políticas restantes
-- =====================================================

-- Otimizar: Admins can view all documents
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_documents;
CREATE POLICY "Admins can view all documents"
ON public.user_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND is_admin = true
  )
);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

