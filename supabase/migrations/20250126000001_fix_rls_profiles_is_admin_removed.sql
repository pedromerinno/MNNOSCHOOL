-- =====================================================
-- CORREÇÃO CRÍTICA: Atualizar funções e políticas RLS
-- que ainda referenciam profiles.is_admin (removida)
-- =====================================================
-- 
-- PROBLEMA: A coluna profiles.is_admin foi removida, mas várias
-- funções e políticas RLS ainda tentam acessá-la, causando
-- erros de RLS que impedem a leitura do perfil do usuário.
--
-- SOLUÇÃO: Atualizar todas as funções e políticas para usar
-- user_empresa.is_admin (admin por empresa) em vez de profiles.is_admin
--
-- RISCO: ALTO se não testar corretamente
-- IMPACTO: CRÍTICO - Corrige problema de leitura de perfil
-- =====================================================

-- =====================================================
-- 1. CORRIGIR FUNÇÕES QUE REFERENCIAM profiles.is_admin
-- =====================================================

-- NOTA: A função is_admin(company_id_param) já existe e está correta
-- Ela já verifica admin por empresa ou super admin
-- Não precisamos criar uma nova versão com user_id

-- Função is_user_admin() - deve verificar admin da empresa selecionada OU super_admin
-- NOTA: Esta função agora retorna true se o usuário for admin de QUALQUER empresa
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Função is_user_admin_for_invites() - corrigir para usar user_empresa
CREATE OR REPLACE FUNCTION public.is_user_admin_for_invites()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_is_super_admin boolean := false;
  user_is_admin boolean := false;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar se é super admin
  SELECT COALESCE(super_admin, false)
  INTO user_is_super_admin
  FROM profiles 
  WHERE id = current_user_id;
  
  IF user_is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  SELECT EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = current_user_id AND is_admin = true
  ) INTO user_is_admin;
  
  -- Retornar true se for admin ou super admin
  RETURN user_is_admin OR user_is_super_admin;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN false;
END;
$$;

-- Função is_current_user_admin() - corrigir para usar user_empresa
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Função is_user_admin_or_super_admin() - corrigir para usar user_empresa
CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Função is_admin_secure(user_id) - corrigir para usar user_empresa
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND is_admin = true
  );
END;
$$;

-- Função get_is_admin_secure(user_id) - corrigir para usar user_empresa
CREATE OR REPLACE FUNCTION public.get_is_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND is_admin = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- =====================================================
-- 2. CORRIGIR POLÍTICAS RLS QUE REFERENCIAM profiles.is_admin
-- =====================================================

-- Política "Admins see users from their companies" - remover referência a is_admin
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
      SELECT 1 FROM user_empresa
      WHERE user_id = (select auth.uid()) AND is_admin = true
    ) THEN (
      EXISTS (
        SELECT 1 FROM user_empresa ue1
        WHERE ue1.user_id = profiles.id
        AND EXISTS (
          SELECT 1 FROM user_empresa ue2
          WHERE ue2.user_id = (select auth.uid())
          AND ue2.empresa_id = ue1.empresa_id
          AND ue2.is_admin = true
        )
      )
      OR (profiles.id = (select auth.uid()))
    )
    ELSE (profiles.id = (select auth.uid()))
  END
);

-- Política "Admins can view all profiles" - usar função corrigida
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND is_admin = true
  )
);

-- Política "Admins can update all profiles" - usar função corrigida
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND is_admin = true
  )
);

-- Política "Admins can update profiles" - corrigir
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = (select auth.uid()) AND is_admin = true
  )
);

-- Política para job_roles - corrigir referências a is_admin
DROP POLICY IF EXISTS "Allow admins to manage job_roles" ON public.job_roles;
CREATE POLICY "Allow admins to manage job_roles"
ON public.job_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN job_roles jr ON jr.company_id = ue.empresa_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND jr.id = job_roles.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN job_roles jr ON jr.company_id = ue.empresa_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND jr.id = job_roles.id
  )
);

-- Política "Admins can manage job roles" - corrigir
DROP POLICY IF EXISTS "Admins can manage job roles" ON public.job_roles;
CREATE POLICY "Admins can manage job roles"
ON public.job_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN job_roles jr ON jr.company_id = ue.empresa_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND jr.id = job_roles.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa ue
    JOIN job_roles jr ON jr.company_id = ue.empresa_id
    WHERE ue.user_id = (select auth.uid())
    AND ue.is_admin = true
    AND jr.id = job_roles.id
  )
);

-- Política "Users can view job roles for their companies" - corrigir
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
    WHERE id = (select auth.uid()) AND super_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = (select auth.uid())
    AND ue.empresa_id = job_roles.company_id
    AND ue.is_admin = true
  )
);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON FUNCTION public.is_admin(uuid) IS 'Verifica se um usuário é admin de qualquer empresa OU super admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.is_user_admin() IS 'Verifica se o usuário atual é admin de qualquer empresa OU super admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.is_user_admin_for_invites() IS 'Verifica se o usuário atual pode enviar convites. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.is_current_user_admin() IS 'Verifica se o usuário atual é admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.is_user_admin_or_super_admin() IS 'Verifica se o usuário atual é admin ou super admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.is_admin_secure(uuid) IS 'Verifica se um usuário é admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.get_is_admin_secure(uuid) IS 'Obtém se um usuário é admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';

