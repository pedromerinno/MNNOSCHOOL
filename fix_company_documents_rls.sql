-- =====================================================
-- FIX: Corrigir política RLS para INSERT em company_documents
-- =====================================================
-- Problema: A política atual usa NEW.company_id que não funciona
-- Solução: Usar a mesma sintaxe que funciona em company_access
-- =====================================================

-- Remover a política antiga
DROP POLICY IF EXISTS "company_documents_insert" ON public.company_documents;

-- Criar a política corrigida usando a mesma sintaxe de company_access
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

-- Verificar se a política foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'company_documents'
AND policyname = 'company_documents_insert';

