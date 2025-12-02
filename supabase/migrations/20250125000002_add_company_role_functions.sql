-- =====================================================
-- MIGRAÇÃO: Funções helper para verificação de roles por empresa
-- =====================================================
-- 
-- Adiciona funções auxiliares para verificar roles considerando empresa
--
-- RISCO: BAIXO - Apenas adiciona funções
-- IMPACTO: ALTO - Base para atualizar todas as verificações de role
-- =====================================================

-- Função 1: Verificar se usuário é admin de uma empresa específica
CREATE OR REPLACE FUNCTION public.is_user_admin_for_company(
  user_id_param UUID,
  company_id_param UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso a tudo
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id_param AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin da empresa específica
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = user_id_param
      AND empresa_id = company_id_param
      AND is_admin = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_user_admin_for_company IS 'Verifica se um usuário é admin de uma empresa específica. Super admins sempre retornam true.';

-- Função 2: Verificar se usuário atual é admin de uma empresa específica
CREATE OR REPLACE FUNCTION public.is_admin_for_company(
  company_id_param UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN public.is_user_admin_for_company(auth.uid(), company_id_param);
END;
$$;

COMMENT ON FUNCTION public.is_admin_for_company IS 'Verifica se o usuário atual é admin de uma empresa específica.';

-- Função 3: Obter cargo do usuário em uma empresa específica
CREATE OR REPLACE FUNCTION public.get_user_job_role_for_company(
  user_id_param UUID,
  company_id_param UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  job_role_id UUID;
BEGIN
  SELECT cargo_id INTO job_role_id
  FROM public.user_empresa
  WHERE user_id = user_id_param
    AND empresa_id = company_id_param
  LIMIT 1;
  
  RETURN job_role_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_job_role_for_company IS 'Retorna o cargo_id de um usuário em uma empresa específica. Retorna NULL se usuário não tem cargo naquela empresa.';

-- Função 4: Verificar se usuário pertence a uma empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(
  user_id_param UUID,
  company_id_param UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = user_id_param
      AND empresa_id = company_id_param
  );
END;
$$;

COMMENT ON FUNCTION public.user_belongs_to_company IS 'Verifica se um usuário pertence a uma empresa específica.';

-- Função 5: Trigger para validar que cargo_id pertence à empresa
CREATE OR REPLACE FUNCTION public.validate_user_empresa_cargo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cargo_company_id UUID;
BEGIN
  -- Se cargo_id é NULL, tudo bem (usuário pode não ter cargo)
  IF NEW.cargo_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar a empresa do cargo
  SELECT company_id INTO cargo_company_id
  FROM public.job_roles
  WHERE id = NEW.cargo_id;
  
  -- Se cargo não existe, erro
  IF cargo_company_id IS NULL THEN
    RAISE EXCEPTION 'Cargo % não existe', NEW.cargo_id;
  END IF;
  
  -- Se cargo não pertence à empresa da associação, erro
  IF cargo_company_id != NEW.empresa_id THEN
    RAISE EXCEPTION 'Cargo % pertence à empresa % mas está sendo atribuído à empresa %', 
      NEW.cargo_id, cargo_company_id, NEW.empresa_id;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_user_empresa_cargo IS 'Valida que o cargo_id atribuído pertence à empresa da associação user_empresa.';

-- Criar trigger para validar cargo antes de inserir/atualizar
DROP TRIGGER IF EXISTS validate_cargo_belongs_to_company ON public.user_empresa;
CREATE TRIGGER validate_cargo_belongs_to_company
  BEFORE INSERT OR UPDATE OF cargo_id, empresa_id
  ON public.user_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_empresa_cargo();

-- Função 6: Atualizar função is_user_admin_or_super_admin para aceitar empresa
-- Mas manter a versão sem parâmetro para compatibilidade temporária
CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin_for_company(
  company_id_param UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso a tudo
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin da empresa
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresa
    WHERE user_id = auth.uid()
      AND empresa_id = company_id_param
      AND is_admin = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_user_admin_or_super_admin_for_company IS 'Verifica se o usuário atual é admin ou super admin para uma empresa específica.';

