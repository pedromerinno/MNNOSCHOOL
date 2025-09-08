-- Fix security vulnerability: Restrict company_videos access to company members only

-- Drop the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view company videos" ON public.company_videos;

-- Create secure policies for company_videos table
CREATE POLICY "Users can view videos from their companies"
ON public.company_videos
FOR SELECT
USING (
  -- Allow if user belongs to the company that owns the video
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = company_videos.company_id
  )
  OR
  -- Allow admins and super admins to view all videos
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (p.is_admin = true OR p.super_admin = true)
  )
);

-- Ensure admins can still manage company videos (keep existing policy)
-- The "Only admins can modify company videos" policy should remain as is