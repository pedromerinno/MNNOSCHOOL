-- =====================================================
-- CORREÇÃO: Ambiguidade de is_admin em políticas de cursos
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- Várias políticas RLS e funções ainda referenciam profiles.is_admin
-- que não existe mais. A coluna is_admin foi movida para user_empresa.is_admin.
-- Isso causa erro "column reference 'is_admin' is ambiguous" quando há JOINs.
--
-- SOLUÇÃO:
-- Atualizar todas as políticas e funções para usar user_empresa.is_admin
-- ou funções helper que verificam admin corretamente.
-- =====================================================

-- =====================================================
-- 1. CORRIGIR FUNÇÃO user_can_access_course
-- =====================================================
-- A função ainda referencia profiles.is_admin que não existe mais

DROP FUNCTION IF EXISTS public.user_can_access_course(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.user_can_access_course(_course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_has_company_access boolean := false;
  course_has_role_restrictions boolean := false;
  user_has_required_role boolean := false;
  current_user_id uuid;
  is_super_admin_val boolean := false;
  is_admin_val boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar se é super admin primeiro
  SELECT COALESCE(super_admin, false) INTO is_super_admin_val
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  -- Check if user belongs to a company that has access to this course
  SELECT EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = _course_id AND ue.user_id = current_user_id
  ) INTO user_has_company_access;
  
  -- If user doesn't have company access, check if they're an admin
  IF NOT user_has_company_access THEN
    -- Verificar se é super admin ou admin de alguma empresa
    IF is_super_admin_val THEN
      RETURN true;
    END IF;
    
    -- Verificar se é admin de alguma empresa
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id AND is_admin = true
      LIMIT 1
    ) INTO is_admin_val;
    
    RETURN is_admin_val;
  END IF;
  
  -- Check if the course has job role restrictions
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    WHERE cjr.course_id = _course_id
  ) INTO course_has_role_restrictions;
  
  -- If no role restrictions, user can access
  IF NOT course_has_role_restrictions THEN
    RETURN true;
  END IF;
  
  -- Check if user has one of the required roles
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    JOIN public.profiles p ON p.cargo_id = cjr.job_role_id
    WHERE cjr.course_id = _course_id AND p.id = current_user_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$$;

COMMENT ON FUNCTION public.user_can_access_course(uuid) IS 
'Verifica se o usuário atual pode acessar um curso. Corrigida para usar user_empresa.is_admin em vez de profiles.is_admin.';

-- =====================================================
-- 2. CORRIGIR POLÍTICAS RLS DE COURSES
-- =====================================================

-- Corrigir: Admin or super admin can see all courses
DROP POLICY IF EXISTS "Admin or super admin can see all courses" ON public.courses;
CREATE POLICY "Admin or super admin can see all courses"
ON public.courses
FOR SELECT
USING (
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa vê tudo
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
  OR
  -- Usuário vê cursos da sua empresa
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id AND ue.user_id = auth.uid()
  )
);

-- Corrigir: Admins can manage courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
ON public.courses
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
)
WITH CHECK (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
);

-- Corrigir: Users can view courses from their companies or if they are admin
DROP POLICY IF EXISTS "Users can view courses from their companies or if they are admi" ON public.courses;
CREATE POLICY "Users can view courses from their companies or if they are admin"
ON public.courses
FOR SELECT
USING (
  -- Usuário vê cursos da sua empresa
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id AND ue.user_id = auth.uid()
  )
  OR
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa vê tudo
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 3. CORRIGIR POLÍTICAS RLS DE COMPANY_COURSES
-- =====================================================

-- Corrigir: Admins can manage company_courses
DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
CREATE POLICY "Admins can manage company_courses"
ON public.company_courses
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin da empresa específica pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = company_courses.empresa_id
    AND ue.is_admin = true
  )
)
WITH CHECK (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin da empresa específica pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = company_courses.empresa_id
    AND ue.is_admin = true
  )
);

-- Corrigir: Control course-company associations
DROP POLICY IF EXISTS "Control course-company associations" ON public.company_courses;
CREATE POLICY "Control course-company associations"
ON public.company_courses
FOR ALL
USING (
  CASE
    -- Super admin pode tudo
    WHEN EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.super_admin = true
    ) THEN true
    -- Admin da empresa específica pode gerenciar
    WHEN EXISTS (
      SELECT 1 FROM public.user_empresa ue
      WHERE ue.user_id = auth.uid() 
      AND ue.empresa_id = company_courses.empresa_id
      AND ue.is_admin = true
    ) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE
    -- Super admin pode tudo
    WHEN EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.super_admin = true
    ) THEN true
    -- Admin da empresa específica pode gerenciar
    WHEN EXISTS (
      SELECT 1 FROM public.user_empresa ue
      WHERE ue.user_id = auth.uid() 
      AND ue.empresa_id = company_courses.empresa_id
      AND ue.is_admin = true
    ) THEN true
    ELSE false
  END
);

-- Corrigir: Users can view company_courses they belong to or if admin
DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;
CREATE POLICY "Users can view company_courses they belong to or if admin"
ON public.company_courses
FOR SELECT
USING (
  -- Usuário vê cursos da empresa que pertence
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.empresa_id = company_courses.empresa_id
  )
  OR
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa vê tudo
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 4. CORRIGIR POLÍTICAS RLS DE LESSONS
-- =====================================================

-- Corrigir: Admins can manage lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
ON public.lessons
FOR ALL
USING (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
)
WITH CHECK (
  -- Super admin pode gerenciar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.super_admin = true
  )
  OR
  -- Admin de alguma empresa pode gerenciar
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() AND ue.is_admin = true
    LIMIT 1
  )
);

-- Recriar política que usa a função corrigida
DROP POLICY IF EXISTS "Users can view lessons from courses they have access to" ON public.lessons;
CREATE POLICY "Users can view lessons from courses they have access to"
ON public.lessons
FOR SELECT
USING (public.user_can_access_course(course_id));

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================




