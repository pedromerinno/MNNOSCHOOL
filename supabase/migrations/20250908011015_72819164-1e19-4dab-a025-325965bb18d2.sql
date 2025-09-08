-- FIX INFINITE RECURSION: Create security definer functions and update policies

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.user_is_company_admin(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = company_id
    AND ue.is_admin = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_any_company()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_empresa ue
    WHERE ue.user_id = auth.uid()
  );
END;
$$;

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Super admins and company admins can manage memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view own memberships, admins can view company memberships" ON public.user_empresa;

-- Create new safe policies using security definer functions
CREATE POLICY "Super admins can manage all memberships"
ON public.user_empresa
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Admins can manage memberships for their companies"
ON public.user_empresa
FOR ALL
USING (
  public.is_user_admin() AND 
  public.user_is_company_admin(user_empresa.empresa_id)
)
WITH CHECK (
  public.is_user_admin() AND 
  public.user_is_company_admin(user_empresa.empresa_id)
);

CREATE POLICY "Users can view their own memberships"
ON public.user_empresa
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view memberships for their companies"
ON public.user_empresa
FOR SELECT
USING (
  public.is_user_admin() AND 
  public.user_is_company_admin(user_empresa.empresa_id)
);

-- Also fix any other policies that might have similar issues in empresas table
DROP POLICY IF EXISTS "Users can view their admin companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can update their admin companies" ON public.empresas;

CREATE POLICY "Users can view companies they admin"
ON public.empresas
FOR SELECT
USING (
  public.is_super_admin() OR
  public.user_is_company_admin(empresas.id)
);

CREATE POLICY "Users can update companies they admin"
ON public.empresas
FOR UPDATE
USING (
  public.is_super_admin() OR
  public.user_is_company_admin(empresas.id)
);