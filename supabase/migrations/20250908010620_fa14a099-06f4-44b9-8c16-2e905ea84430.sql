-- COMPREHENSIVE SECURITY FIX: Address critical vulnerabilities
-- 1. Secure Storage Buckets - Make document buckets private
UPDATE storage.buckets 
SET public = false 
WHERE name IN ('documents', 'User Documents');

-- 2. Drop overly permissive RLS policies on profiles
DROP POLICY IF EXISTS "All acess" ON public.profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to view all profiles" ON public.profiles;

-- Keep only secure profile policies - users see own profile, admins see company users
-- The "Admins see users from their companies" policy is already secure

-- 3. Add trigger to prevent role escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only super admins can change admin/super_admin status
  IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin OR OLD.super_admin IS DISTINCT FROM NEW.super_admin) THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only super administrators can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Lock down user_empresa (company membership) - remove permissive policies
DROP POLICY IF EXISTS "Allow all authenticated users to view all user_empresa" ON public.user_empresa;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar todas as relações usu" ON public.user_empresa;
DROP POLICY IF EXISTS "Allow users to insert their own relationships or admin can inse" ON public.user_empresa;
DROP POLICY IF EXISTS "Allow users to delete their own relationships or admin can dele" ON public.user_empresa;

-- Replace with secure policies - only admins can manage company membership
CREATE POLICY "Super admins and company admins can manage memberships"
ON public.user_empresa
FOR ALL
USING (
  public.is_super_admin() OR 
  (public.is_user_admin() AND EXISTS (
    SELECT 1 FROM public.user_empresa ue 
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = user_empresa.empresa_id
  ))
)
WITH CHECK (
  public.is_super_admin() OR 
  (public.is_user_admin() AND EXISTS (
    SELECT 1 FROM public.user_empresa ue 
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = user_empresa.empresa_id
  ))
);

-- Users can view their own memberships, admins can view company memberships
CREATE POLICY "Users can view own memberships, admins can view company memberships"
ON public.user_empresa
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_super_admin() OR
  (public.is_user_admin() AND EXISTS (
    SELECT 1 FROM public.user_empresa ue 
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = user_empresa.empresa_id
  ))
);

-- 5. Clean up empresas RLS - remove overly permissive policies  
DROP POLICY IF EXISTS "Allow all authenticated users to view all empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir empresas" ON public.empresas;

-- Fix the broken policy reference
DROP POLICY IF EXISTS "Users can view their admin companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can update their admin companies" ON public.empresas;

CREATE POLICY "Users can view their admin companies"
ON public.empresas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.empresa_id = empresas.id 
    AND ue.user_id = auth.uid() 
    AND ue.is_admin = true
  ) OR public.is_super_admin()
);

CREATE POLICY "Users can update their admin companies"
ON public.empresas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.empresa_id = empresas.id 
    AND ue.user_id = auth.uid() 
    AND ue.is_admin = true
  ) OR public.is_super_admin()
);

-- 6. Restrict discussions and comments - remove public access
DROP POLICY IF EXISTS "Allow users to view discussions" ON public.discussions;
DROP POLICY IF EXISTS "Allow users to view discussion replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.lesson_comments;

-- Keep existing secure policies that check company membership

-- 7. Add Storage RLS for document buckets
CREATE POLICY "Users can view their own documents or company documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('documents', 'User Documents') AND (
    -- File path starts with user ID (user's own files)
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- User belongs to company that owns the document
    EXISTS (
      SELECT 1 FROM public.user_documents ud
      JOIN public.user_empresa ue ON ud.company_id = ue.empresa_id
      WHERE ud.file_path = name AND ue.user_id = auth.uid()
    ) OR
    -- User is admin/super admin
    public.is_user_admin_or_super_admin()
  )
);

CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('documents', 'User Documents') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update/delete their own files or admins can manage company files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id IN ('documents', 'User Documents') AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.is_user_admin_or_super_admin()
  )
);

CREATE POLICY "Users can delete their own files or admins can manage company files"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('documents', 'User Documents') AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.is_user_admin_or_super_admin()
  )
);

-- 8. Update security definer functions to be more secure
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND (is_admin = true OR super_admin = true)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_is_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((SELECT is_admin FROM profiles WHERE id = user_id), false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_is_super_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((SELECT super_admin FROM profiles WHERE id = user_id), false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;