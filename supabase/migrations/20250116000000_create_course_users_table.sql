
-- Create the course_users table to link courses with specific users
CREATE TABLE IF NOT EXISTS public.course_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_users
CREATE POLICY "Users can view course users for their company courses" 
  ON public.course_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_courses cc
      JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
      WHERE cc.course_id = course_users.course_id 
      AND ue.user_id = auth.uid()
    )
    OR public.is_user_admin_or_super_admin()
  );

CREATE POLICY "Admins can manage course users" 
  ON public.course_users 
  FOR ALL 
  USING (public.is_user_admin_or_super_admin())
  WITH CHECK (public.is_user_admin_or_super_admin());

-- Update the user_can_access_course function to include user-specific access checking
CREATE OR REPLACE FUNCTION public.user_can_access_course(_course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_has_company_access boolean := false;
  course_has_role_restrictions boolean := false;
  course_has_user_restrictions boolean := false;
  user_has_required_role boolean := false;
  user_has_specific_access boolean := false;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user belongs to a company that has access to this course
  SELECT EXISTS (
    SELECT 1 FROM public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = _course_id AND ue.user_id = current_user_id
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
    WHERE cjr.course_id = _course_id
  ) INTO course_has_role_restrictions;
  
  -- Check if the course has user-specific restrictions
  SELECT EXISTS (
    SELECT 1 FROM public.course_users cu
    WHERE cu.course_id = _course_id
  ) INTO course_has_user_restrictions;
  
  -- If no restrictions at all, user can access
  IF NOT course_has_role_restrictions AND NOT course_has_user_restrictions THEN
    RETURN true;
  END IF;
  
  -- If there are role restrictions, check if user has one of the required roles
  IF course_has_role_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.course_job_roles cjr
      JOIN public.profiles p ON p.cargo_id = cjr.job_role_id
      WHERE cjr.course_id = _course_id AND p.id = current_user_id
    ) INTO user_has_required_role;
  END IF;
  
  -- If there are user restrictions, check if user has specific access
  IF course_has_user_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.course_users cu
      WHERE cu.course_id = _course_id AND cu.user_id = current_user_id
    ) INTO user_has_specific_access;
  END IF;
  
  -- User can access if they have the required role OR specific user access
  RETURN COALESCE(user_has_required_role, false) OR COALESCE(user_has_specific_access, false);
END;
$$;
