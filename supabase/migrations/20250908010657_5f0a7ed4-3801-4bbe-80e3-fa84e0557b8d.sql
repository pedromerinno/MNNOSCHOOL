-- FIX REMAINING SECURITY WARNINGS: Update all security definer functions to have proper search_path

-- Update all remaining security definer functions to include SET search_path = public
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_company(user_id uuid, company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND empresa_id = company_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin_for_invites()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_is_admin boolean := false;
  user_is_super_admin boolean := false;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar as permissões do usuário
  SELECT 
    COALESCE(is_admin, false),
    COALESCE(super_admin, false)
  INTO user_is_admin, user_is_super_admin
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Retornar true se for admin ou super admin
  RETURN COALESCE(user_is_admin, false) OR COALESCE(user_is_super_admin, false);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.get_is_admin_secure(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.get_is_super_admin_secure(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_company(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND empresa_id = company_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT super_admin FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_company_of_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_empresa ue1
    WHERE ue1.user_id = profile_id
    AND EXISTS (
      SELECT 1 FROM user_empresa ue2
      WHERE ue2.user_id = auth.uid()
      AND ue2.empresa_id = ue1.empresa_id
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    COALESCE(is_admin, false) OR 
    COALESCE(super_admin, false) 
  FROM profiles 
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_user_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND super_admin = true
  );
END;
$$;