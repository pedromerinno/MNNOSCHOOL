-- =====================================================
-- MIGRAÇÃO: Atualizar funções de acesso para usar roles por empresa
-- =====================================================
-- 
-- Atualiza funções que verificam acesso baseado em cargo/role
-- para considerar a empresa do contexto
--
-- RISCO: MÉDIO - Pode afetar lógica de acesso existente
-- IMPACTO: ALTO - Todas as verificações de acesso
-- =====================================================

-- Função 1: Atualizar user_can_access_course para usar cargo por empresa
-- Esta função já considera empresa via company_courses, só precisa
-- verificar cargo_id em user_empresa considerando a empresa correta
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
  user_company_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user belongs to a company that has access to this course
  SELECT EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = _course_id AND ue.user_id = current_user_id
  ) INTO user_has_company_access;
  
  -- If user doesn't have company access, check if they're a super admin
  IF NOT user_has_company_access THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = current_user_id AND super_admin = true
    );
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
  
  -- Check if user has one of the required roles in ANY of their companies
  -- that have access to this course
  SELECT EXISTS (
    SELECT 1 
    FROM public.course_job_roles cjr
    JOIN public.company_courses cc ON cc.course_id = cjr.course_id
    JOIN public.user_empresa ue ON (
      ue.empresa_id = cc.empresa_id 
      AND ue.user_id = current_user_id
      AND ue.cargo_id = cjr.job_role_id
    )
    WHERE cjr.course_id = _course_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$$;

COMMENT ON FUNCTION public.user_can_access_course IS 'Verifica se o usuário pode acessar um curso. Considera o cargo do usuário em cada empresa que tem acesso ao curso.';

-- Função 2: Atualizar user_can_access_company_document para usar cargo por empresa
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
  document_company_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Get the company of the document
  SELECT company_id INTO document_company_id
  FROM public.company_documents
  WHERE id = document_id;
  
  IF document_company_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se usuário pertence à empresa do documento
  SELECT EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = current_user_id
      AND ue.empresa_id = document_company_id
  ) INTO user_has_company_access;
  
  -- Se usuário não tem acesso à empresa, verificar se é super admin
  IF NOT user_has_company_access THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = current_user_id AND super_admin = true
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
  -- na empresa do documento
  IF document_has_role_restrictions THEN
    SELECT EXISTS (
      SELECT 1 
      FROM public.company_document_job_roles cdjr
      JOIN public.user_empresa ue ON (
        ue.user_id = current_user_id
        AND ue.empresa_id = document_company_id
        AND ue.cargo_id = cdjr.job_role_id
      )
      WHERE cdjr.company_document_id = document_id
    ) INTO user_has_required_role;
  END IF;
  
  -- Se há restrições de usuário, verificar se usuário tem acesso específico
  IF document_has_user_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.company_document_users cdu
      WHERE cdu.company_document_id = document_id 
        AND cdu.user_id = current_user_id
    ) INTO user_has_specific_access;
  END IF;
  
  -- Usuário pode acessar se tem o cargo necessário OU acesso específico
  RETURN user_has_required_role OR user_has_specific_access;
END;
$$;

COMMENT ON FUNCTION public.user_can_access_company_document IS 'Verifica se o usuário pode acessar um documento da empresa. Considera o cargo do usuário na empresa do documento.';

-- Função 3: Atualizar is_admin() para aceitar empresa como parâmetro opcional
-- Mantém versão sem parâmetro para compatibilidade (verifica se é admin de qualquer empresa)
CREATE OR REPLACE FUNCTION public.is_admin(company_id_param uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Se empresa especificada, verificar admin dessa empresa
  IF company_id_param IS NOT NULL THEN
    RETURN public.is_admin_for_company(company_id_param);
  END IF;
  
  -- Sem empresa, verificar se é admin de qualquer empresa ou super admin
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 'Verifica se o usuário é admin. Se company_id_param for fornecido, verifica admin dessa empresa específica. Caso contrário, verifica se é admin de qualquer empresa ou super admin.';

-- Função 4: Atualizar is_user_admin() para considerar empresa
-- Mantém comportamento antigo para compatibilidade
CREATE OR REPLACE FUNCTION public.is_user_admin(company_id_param uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Se empresa especificada, verificar admin dessa empresa
  IF company_id_param IS NOT NULL THEN
    RETURN public.is_admin_for_company(company_id_param);
  END IF;
  
  -- Sem empresa, verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_user_admin IS 'Verifica se o usuário é admin de uma empresa. Se company_id_param não for fornecido, verifica se é admin de qualquer empresa.';

-- Função 5: Manter is_super_admin() - não muda (é global)
-- Já está correta, não precisa alterar

-- Função 6: Atualizar is_user_admin_or_super_admin() para aceitar empresa
CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin(company_id_param uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin sempre retorna true
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Se empresa especificada, verificar admin dessa empresa
  IF company_id_param IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = auth.uid()
        AND empresa_id = company_id_param
        AND is_admin = true
    );
  END IF;
  
  -- Sem empresa, verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_user_admin_or_super_admin IS 'Verifica se o usuário é admin ou super admin. Se company_id_param for fornecido, verifica admin dessa empresa específica.';

