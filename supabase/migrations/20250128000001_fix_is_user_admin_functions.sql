-- =====================================================
-- CORREÇÃO: Funções is_user_admin quebradas
-- =====================================================
-- 
-- PROBLEMA: A migração 20250908010657 sobrescreveu as funções
-- is_user_admin() e is_user_admin_for_invites() com versões
-- que ainda tentam buscar is_admin de profiles, mas essa
-- coluna foi removida e agora está em user_empresa.
--
-- SOLUÇÃO: Corrigir essas funções para usar user_empresa.is_admin
--
-- IMPACTO: CRÍTICO - Corrige problema de visualização de usuários
-- =====================================================

-- Corrigir is_user_admin() - deve verificar user_empresa.is_admin
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

-- Corrigir is_user_admin_for_invites() - deve verificar user_empresa.is_admin
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
  
  -- Verificar se é admin de qualquer empresa (em user_empresa, não profiles)
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

-- Corrigir is_user_admin_or_super_admin() - deve verificar user_empresa.is_admin
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
  
  -- Verificar se é admin de qualquer empresa (em user_empresa, não profiles)
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Corrigir is_current_user_admin() - deve verificar user_empresa.is_admin
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
  
  -- Verificar se é admin de qualquer empresa (em user_empresa, não profiles)
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Corrigir is_admin(user_id) - deve verificar user_empresa.is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
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
  
  -- Verificar se é admin de qualquer empresa (em user_empresa, não profiles)
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND is_admin = true
  );
END;
$$;

