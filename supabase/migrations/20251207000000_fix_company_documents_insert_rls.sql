-- Fix RLS policy for company_documents INSERT
-- The issue is that NEW.company_id doesn't work in WITH CHECK clause
-- Solution: Use the same syntax that works in company_access policy
-- This directly references the table column in WITH CHECK

-- Drop the existing policy
DROP POLICY IF EXISTS "company_documents_insert" ON public.company_documents;

-- Recreate the policy using the same pattern as company_access
CREATE POLICY "company_documents_insert"
ON public.company_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_empresa 
    WHERE user_id = auth.uid() 
    AND empresa_id = company_documents.company_id 
    AND is_admin = true
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND super_admin = true
  )
);

