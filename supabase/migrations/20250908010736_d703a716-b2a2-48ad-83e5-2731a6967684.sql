-- FIX REMAINING SECURITY DEFINER FUNCTIONS: Update all remaining functions

-- Update remaining security definer functions to include SET search_path = public
CREATE OR REPLACE FUNCTION public.user_can_access_company_document(document_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_has_company_access boolean := false;
  document_has_role_restrictions boolean := false;
  document_has_user_restrictions boolean := false;
  user_has_required_role boolean := false;
  user_has_specific_access boolean := false;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar se usuário pertence à empresa do documento
  SELECT EXISTS (
    SELECT 1 FROM public.company_documents cd
    JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = document_id AND ue.user_id = current_user_id
  ) INTO user_has_company_access;
  
  -- Se usuário não tem acesso à empresa, verificar se é admin
  IF NOT user_has_company_access THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = current_user_id AND (is_admin = true OR super_admin = true)
    );
  END IF;
  
  -- Verificar se o documento tem restrições de cargo
  SELECT EXISTS (
    SELECT 1 FROM public.company_document_job_roles cdjr
    WHERE cdjr.company_document_id = document_id
  ) INTO document_has_role_restrictions;
  
  -- Verificar se o documento tem restrições de usuário específico
  SELECT EXISTS (
    SELECT 1 FROM public.company_document_users cdu
    WHERE cdu.company_document_id = document_id
  ) INTO document_has_user_restrictions;
  
  -- Se não há nenhuma restrição, usuário pode acessar
  IF NOT document_has_role_restrictions AND NOT document_has_user_restrictions THEN
    RETURN true;
  END IF;
  
  -- Se há restrições de cargo, verificar se usuário tem um dos cargos necessários
  IF document_has_role_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.company_document_job_roles cdjr
      JOIN public.profiles p ON p.cargo_id = cdjr.job_role_id
      WHERE cdjr.company_document_id = document_id AND p.id = current_user_id
    ) INTO user_has_required_role;
  END IF;
  
  -- Se há restrições de usuário, verificar se usuário tem acesso específico
  IF document_has_user_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.company_document_users cdu
      WHERE cdu.company_document_id = document_id AND cdu.user_id = current_user_id
    ) INTO user_has_specific_access;
  END IF;
  
  -- Usuário pode acessar se tem o cargo necessário OU acesso específico
  RETURN COALESCE(user_has_required_role, false) OR COALESCE(user_has_specific_access, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_course(course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_has_company_access boolean := false;
  course_has_role_restrictions boolean := false;
  user_has_required_role boolean := false;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user belongs to a company that has access to this course
  SELECT EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_id AND ue.user_id = current_user_id
  ) INTO user_has_company_access;
  
  -- If user doesn't have company access, check if they're an admin
  IF NOT user_has_company_access THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = current_user_id AND (is_admin = true OR super_admin = true)
    );
  END IF;
  
  -- Check if the course has job role restrictions
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    WHERE cjr.course_id = course_id
  ) INTO course_has_role_restrictions;
  
  -- If no role restrictions, user can access
  IF NOT course_has_role_restrictions THEN
    RETURN true;
  END IF;
  
  -- Check if user has one of the required roles
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    JOIN public.profiles p ON p.cargo_id = cjr.job_role_id
    WHERE cjr.course_id = course_id AND p.id = current_user_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_companies_for_admin()
RETURNS SETOF empresas
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.empresas ORDER BY nome;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_secure()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_companies(user_id uuid)
RETURNS SETOF empresas
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if user is super admin
  IF EXISTS (SELECT 1 FROM profiles WHERE profiles.id = user_id AND profiles.super_admin = true) THEN
    -- Super admins see all companies
    RETURN QUERY SELECT * FROM public.empresas ORDER BY nome;
  ELSE
    -- Regular users and admins see only related companies
    RETURN QUERY 
      SELECT e.* 
      FROM public.empresas e
      JOIN public.user_empresa ue ON e.id = ue.empresa_id
      WHERE ue.user_id = get_user_companies.user_id
      ORDER BY e.nome;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_companies_for_admin(current_user_id uuid)
RETURNS SETOF empresas
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE 
  is_super_admin boolean;
  is_admin_user boolean;
BEGIN
  -- Properly qualify column references to avoid ambiguity
  SELECT 
    COALESCE(p.super_admin, false),
    COALESCE(p.is_admin, false)
  INTO is_super_admin, is_admin_user
  FROM profiles p
  WHERE p.id = current_user_id;

  -- If user is super admin, return all companies
  IF is_super_admin THEN
    RETURN QUERY 
      SELECT * FROM empresas ORDER BY nome;
  
  -- If user is admin, return companies related to the user
  ELSIF is_admin_user THEN
    RETURN QUERY
      SELECT e.* 
      FROM empresas e
      JOIN user_empresa ue ON e.id = ue.empresa_id
      WHERE ue.user_id = current_user_id
      ORDER BY e.nome;
  
  -- If user is not admin, return empty set
  ELSE
    RETURN;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, primeiro_login)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    true
  );
  RETURN NEW;
END;
$$;