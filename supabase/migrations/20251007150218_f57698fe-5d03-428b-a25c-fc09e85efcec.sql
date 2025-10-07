-- Fix ambiguous column reference in user_can_access_course function
-- Need to drop with CASCADE and recreate

DROP FUNCTION IF EXISTS public.user_can_access_course(uuid) CASCADE;

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
  
  -- If no role restrictions, user can access
  IF NOT course_has_role_restrictions THEN
    RETURN true;
  END IF;
  
  -- Check if user has one of the required roles
  SELECT EXISTS (
    SELECT 1 FROM public.course_job_roles cjr
    JOIN public.profiles p ON p.cargo_id = cjr.job_role_id
    WHERE cjr.course_id = _course_id AND p.id = current_user_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$$;

-- Recreate the RLS policy that was dropped
CREATE POLICY "Users can view lessons from courses they have access to"
ON public.lessons
FOR SELECT
USING (user_can_access_course(course_id));