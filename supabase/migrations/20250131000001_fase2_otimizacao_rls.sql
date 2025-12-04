-- =====================================================
-- FASE 2: OTIMIZAÇÃO DE POLÍTICAS RLS
-- =====================================================
-- 
-- Esta migração:
-- 1. Otimiza funções helper para usar (select auth.uid()) 
-- 2. Consolida políticas RLS duplicadas
-- 3. Atualiza políticas para usar funções otimizadas
--
-- RISCO: MÉDIO - Afeta segurança, mas não modifica dados
-- IMPACTO: ALTO - Melhora performance significativamente
-- =====================================================

-- =====================================================
-- PARTE 1: OTIMIZAR FUNÇÕES HELPER EXISTENTES
-- =====================================================

-- Otimizar check_super_admin para usar (select auth.uid())
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
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
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

-- Otimizar check_company_admin para usar (select auth.uid())
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
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
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

-- Otimizar is_current_user_admin_for_company para usar (select auth.uid())
CREATE OR REPLACE FUNCTION public.is_current_user_admin_for_company(company_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin tem acesso a tudo
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = current_user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Se company_id_param é NULL, verificar se é admin de qualquer empresa
  IF company_id_param IS NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id AND is_admin = true
      LIMIT 1
    );
  END IF;
  
  -- Verificar se é admin da empresa específica
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
      AND empresa_id = company_id_param
      AND is_admin = true
  );
END;
$$;

-- Otimizar is_user_admin_or_super_admin para usar (select auth.uid())
CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = current_user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = current_user_id AND is_admin = true
    LIMIT 1
  );
END;
$$;

-- Otimizar get_is_super_admin_secure para usar (select auth.uid())
CREATE OR REPLACE FUNCTION public.get_is_super_admin_secure(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF user_id_param IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id_param AND super_admin = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Função helper otimizada para verificar se usuário pertence a empresa
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
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = current_user_id
    AND empresa_id = _empresa_id
    LIMIT 1
  ) INTO belongs;
  
  RETURN COALESCE(belongs, false);
END;
$$;

-- Função helper otimizada para verificar acesso a curso
CREATE OR REPLACE FUNCTION public.user_can_access_course(course_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Usar (select auth.uid()) para evitar re-avaliação
  current_user_id := (select auth.uid());
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin ou admin de qualquer empresa pode ver
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = current_user_id AND super_admin = true
  ) OR EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = current_user_id AND is_admin = true
    LIMIT 1
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se usuário tem acesso via company_courses
  RETURN EXISTS (
    SELECT 1 FROM company_courses cc
    JOIN user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_id_param
    AND ue.user_id = current_user_id
  );
END;
$$;

-- Função helper otimizada para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.check_super_admin();
END;
$$;

-- Função helper otimizada para verificar se usuário é admin de empresa
CREATE OR REPLACE FUNCTION public.user_is_company_admin(company_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.check_company_admin(company_id_param);
END;
$$;

-- =====================================================
-- PARTE 2: CONSOLIDAR POLÍTICAS DUPLICADAS
-- =====================================================
-- Remover políticas duplicadas e manter apenas as mais eficientes

-- Company Access: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Users can view company access if related to company" ON public.company_access;
DROP POLICY IF EXISTS "Users can view company access where they belong" ON public.company_access;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view company access"
ON public.company_access
FOR SELECT
USING (
  check_user_in_company(company_id) 
  OR check_company_admin(company_id)
  OR check_super_admin()
);

-- Company Courses: Consolidar políticas duplicadas
DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
DROP POLICY IF EXISTS "Control course-company associations" ON public.company_courses;
DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;
DROP POLICY IF EXISTS "company_courses_select" ON public.company_courses;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Admins can manage company_courses"
ON public.company_courses
FOR ALL
USING (
  check_super_admin() 
  OR check_company_admin(empresa_id)
)
WITH CHECK (
  check_super_admin() 
  OR check_company_admin(empresa_id)
);

CREATE POLICY "Users can view company_courses"
ON public.company_courses
FOR SELECT
USING (
  check_user_in_company(empresa_id)
  OR check_super_admin()
  OR is_user_admin_or_super_admin()
);

-- Courses: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admin or super admin can see all courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view courses from their companies or if they are admi" ON public.courses;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view courses"
ON public.courses
FOR SELECT
USING (
  check_super_admin()
  OR is_user_admin_or_super_admin()
  OR EXISTS (
    SELECT 1 FROM company_courses cc
    JOIN user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id
    AND ue.user_id = (select auth.uid())
  )
);

-- Empresas: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admin or super admin can see companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can lookup companies by ID" ON public.empresas;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view companies"
ON public.empresas
FOR SELECT
USING (
  check_super_admin()
  OR check_company_admin(id)
  OR check_user_in_company(id)
);

-- Empresas: Consolidar políticas UPDATE duplicadas
DROP POLICY IF EXISTS "Admins can update companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can update companies they admin" ON public.empresas;

-- Criar política consolidada otimizada
CREATE POLICY "Admins can update companies"
ON public.empresas
FOR UPDATE
USING (
  check_super_admin()
  OR check_company_admin(id)
)
WITH CHECK (
  check_super_admin()
  OR check_company_admin(id)
);

-- Job Roles: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Allow all authenticated users to view all job_roles" ON public.job_roles;
DROP POLICY IF EXISTS "Todos podem visualizar cargos" ON public.job_roles;
DROP POLICY IF EXISTS "Users can view job roles" ON public.job_roles;

-- Criar política consolidada (todos podem ver)
CREATE POLICY "Users can view job roles"
ON public.job_roles
FOR SELECT
USING (true);

-- Profiles: Consolidar políticas INSERT duplicadas
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_lightweight" ON public.profiles;

-- Criar política consolidada otimizada
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  id = (select auth.uid())
  OR check_super_admin()
);

-- Profiles: Consolidar políticas UPDATE duplicadas
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_lightweight" ON public.profiles;

-- Criar política consolidada otimizada
CREATE POLICY "Users can update profiles"
ON public.profiles
FOR UPDATE
USING (
  id = (select auth.uid())
  OR check_super_admin()
  OR EXISTS (
    SELECT 1 FROM user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
)
WITH CHECK (
  id = (select auth.uid())
  OR check_super_admin()
  OR EXISTS (
    SELECT 1 FROM user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
);

-- Profiles: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (
  id = (select auth.uid())
  OR check_super_admin()
  OR EXISTS (
    SELECT 1 FROM user_empresa ue_admin
    WHERE ue_admin.user_id = (select auth.uid())
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
);

-- Settings: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Super admins can view settings" ON public.settings;

-- Criar política consolidada (todos podem ler, apenas super admin pode modificar)
CREATE POLICY "Users can view settings"
ON public.settings
FOR SELECT
USING (true);

-- User Documents: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can view their own documents or company documents" ON public.user_documents;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view documents"
ON public.user_documents
FOR SELECT
USING (
  user_id = (select auth.uid())
  OR uploaded_by = (select auth.uid())
  OR check_user_in_company(company_id)
  OR check_super_admin()
  OR check_company_admin(company_id)
);

-- User Empresa: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Super admins can view all memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "user_empresa_select" ON public.user_empresa;

-- Criar política consolidada otimizada
CREATE POLICY "Users can view memberships"
ON public.user_empresa
FOR SELECT
USING (
  user_id = (select auth.uid())
  OR check_super_admin()
  OR check_company_admin(empresa_id)
);

-- User Invites: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can manage invites for their companies" ON public.user_invites;
DROP POLICY IF EXISTS "Users can check their own invites" ON public.user_invites;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Admins can manage invites"
ON public.user_invites
FOR ALL
USING (
  is_user_admin_for_invites() = true
)
WITH CHECK (
  is_user_admin_for_invites() = true
);

CREATE POLICY "Users can check their own invites"
ON public.user_invites
FOR SELECT
USING (
  email = (
    SELECT email::text FROM auth.users
    WHERE id = (select auth.uid())
  )
);

-- User Course Progress: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can view all user_course_progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can manage their own course progress" ON public.user_course_progress;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Users can manage their own course progress"
ON public.user_course_progress
FOR ALL
USING (
  user_id = (select auth.uid())
)
WITH CHECK (
  user_id = (select auth.uid())
);

CREATE POLICY "Admins can view all course progress"
ON public.user_course_progress
FOR SELECT
USING (
  check_super_admin()
  OR is_current_user_admin_for_company(NULL::uuid)
);

-- User Lesson Progress: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can view all user_lesson_progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.user_lesson_progress;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Users can manage their own lesson progress"
ON public.user_lesson_progress
FOR ALL
USING (
  user_id = (select auth.uid())
)
WITH CHECK (
  user_id = (select auth.uid())
);

CREATE POLICY "Admins can view all lesson progress"
ON public.user_lesson_progress
FOR SELECT
USING (
  check_super_admin()
  OR is_current_user_admin_for_company(NULL::uuid)
);

-- Company Document Job Roles: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can manage company document job role links" ON public.company_document_job_roles;
DROP POLICY IF EXISTS "Users can view company document job role links" ON public.company_document_job_roles;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Admins can manage document job roles"
ON public.company_document_job_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON ue.user_id = (select auth.uid())
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.empresa_id = cd.company_id
    AND (ue.is_admin = true OR check_super_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON ue.user_id = (select auth.uid())
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.empresa_id = cd.company_id
    AND (ue.is_admin = true OR check_super_admin())
  )
);

CREATE POLICY "Users can view document job roles"
ON public.company_document_job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.user_id = (select auth.uid())
  )
);

-- Company Document Users: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can manage company document user links" ON public.company_document_users;
DROP POLICY IF EXISTS "Users can view company document user links" ON public.company_document_users;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Admins can manage document users"
ON public.company_document_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON ue.user_id = (select auth.uid())
    WHERE cd.id = company_document_users.company_document_id
    AND ue.empresa_id = cd.company_id
    AND (ue.is_admin = true OR check_super_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON ue.user_id = (select auth.uid())
    WHERE cd.id = company_document_users.company_document_id
    AND ue.empresa_id = cd.company_id
    AND (ue.is_admin = true OR check_super_admin())
  )
);

CREATE POLICY "Users can view document users"
ON public.company_document_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM company_documents cd
    JOIN user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_users.company_document_id
    AND ue.user_id = (select auth.uid())
  )
);

-- Course Job Roles: Consolidar políticas SELECT duplicadas
DROP POLICY IF EXISTS "Admins can manage course job roles" ON public.course_job_roles;
DROP POLICY IF EXISTS "Users can view course job roles for their company courses" ON public.course_job_roles;

-- Criar políticas consolidadas otimizadas
CREATE POLICY "Admins can manage course job roles"
ON public.course_job_roles
FOR ALL
USING (
  is_user_admin_or_super_admin()
)
WITH CHECK (
  is_user_admin_or_super_admin()
);

CREATE POLICY "Users can view course job roles"
ON public.course_job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM company_courses cc
    JOIN user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_job_roles.course_id
    AND ue.user_id = (select auth.uid())
  )
  OR is_user_admin_or_super_admin()
);

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 2
-- =====================================================



