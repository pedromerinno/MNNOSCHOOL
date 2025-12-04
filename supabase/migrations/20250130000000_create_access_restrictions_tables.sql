-- Create tables for company access restrictions
-- This allows restricting access to company_access by job roles or specific users

-- Table for job role restrictions
CREATE TABLE IF NOT EXISTS public.company_access_job_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_access_id UUID NOT NULL REFERENCES public.company_access(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_access_id, job_role_id)
);

-- Table for user-specific restrictions
CREATE TABLE IF NOT EXISTS public.company_access_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_access_id UUID NOT NULL REFERENCES public.company_access(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_access_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.company_access_job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_access_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_access_job_roles
-- Users can view restrictions for accesses they can see
CREATE POLICY "Users can view access job role restrictions" 
  ON public.company_access_job_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_job_roles.company_access_id
        AND ue.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  );

-- Admins can manage job role restrictions
CREATE POLICY "Admins can manage access job role restrictions" 
  ON public.company_access_job_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_job_roles.company_access_id
        AND ue.user_id = auth.uid()
        AND ue.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_job_roles.company_access_id
        AND ue.user_id = auth.uid()
        AND ue.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  );

-- RLS Policies for company_access_users
-- Users can view restrictions for accesses they can see
CREATE POLICY "Users can view access user restrictions" 
  ON public.company_access_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_users.company_access_id
        AND ue.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  );

-- Admins can manage user restrictions
CREATE POLICY "Admins can manage access user restrictions" 
  ON public.company_access_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_users.company_access_id
        AND ue.user_id = auth.uid()
        AND ue.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_access ca
      JOIN public.user_empresa ue ON ca.company_id = ue.empresa_id
      WHERE ca.id = company_access_users.company_access_id
        AND ue.user_id = auth.uid()
        AND ue.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND super_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_access_job_roles_access_id 
  ON public.company_access_job_roles(company_access_id);
CREATE INDEX IF NOT EXISTS idx_company_access_job_roles_role_id 
  ON public.company_access_job_roles(job_role_id);

CREATE INDEX IF NOT EXISTS idx_company_access_users_access_id 
  ON public.company_access_users(company_access_id);
CREATE INDEX IF NOT EXISTS idx_company_access_users_user_id 
  ON public.company_access_users(user_id);

