
-- Create the course_job_roles table to link courses with job roles
CREATE TABLE public.course_job_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, job_role_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_job_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_job_roles
CREATE POLICY "Users can view course job roles for their company courses" 
  ON public.course_job_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_courses cc
      JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
      WHERE cc.course_id = course_job_roles.course_id 
      AND ue.user_id = auth.uid()
    )
    OR public.is_user_admin_or_super_admin()
  );

CREATE POLICY "Admins can manage course job roles" 
  ON public.course_job_roles 
  FOR ALL 
  USING (public.is_user_admin_or_super_admin())
  WITH CHECK (public.is_user_admin_or_super_admin());

-- Update the user_can_access_course function to include job role checking
CREATE OR REPLACE FUNCTION public.user_can_access_course(course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
    WHERE cc.course_id = $1 AND ue.user_id = current_user_id
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
    SELECT 1 FROM public.course_job_roles
    WHERE course_id = $1
  ) INTO course_has_role_restrictions;
  
  -- If no role restrictions, user can access
  IF NOT course_has_role_restrictions THEN
    RETURN true;
  END IF;
  
  -- Check if user has one of the required roles
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    JOIN public.profiles p ON p.cargo_id = cjr.job_role_id
    WHERE cjr.course_id = $1 AND p.id = current_user_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$$;
