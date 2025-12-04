-- =====================================================
-- FIX COMPLETO: Corrigir política RLS para INSERT em company_documents
-- =====================================================
-- Este script:
-- 1. Mostra a política atual (se existir)
-- 2. Remove a política antiga
-- 3. Cria a nova política corrigida
-- 4. Verifica se foi criada corretamente
-- =====================================================

-- 1. VERIFICAR POLÍTICA ATUAL
SELECT 
  'POLÍTICA ATUAL (ANTES):' as status,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'company_documents'
AND policyname = 'company_documents_insert';

-- 2. REMOVER POLÍTICA ANTIGA
DROP POLICY IF EXISTS "company_documents_insert" ON public.company_documents;

-- 3. CRIAR NOVA POLÍTICA CORRIGIDA
-- Usando a mesma sintaxe que funciona em company_access
CREATE POLICY "company_documents_insert"
ON public.company_documents
FOR INSERT
WITH CHECK (
  -- Admin da empresa pode inserir documentos da sua empresa
  EXISTS (
    SELECT 1 FROM public.user_empresa 
    WHERE user_id = auth.uid() 
    AND empresa_id = company_documents.company_id 
    AND is_admin = true
  ) 
  OR 
  -- Super admin pode inserir qualquer documento
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND super_admin = true
  )
);

-- 4. VERIFICAR SE FOI CRIADA CORRETAMENTE
SELECT 
  'POLÍTICA NOVA (DEPOIS):' as status,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'company_documents'
AND policyname = 'company_documents_insert';

-- 5. VERIFICAR TODAS AS POLÍTICAS DA TABELA
SELECT 
  'TODAS AS POLÍTICAS:' as status,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'SELECT'
    WHEN cmd = 'INSERT' THEN 'INSERT'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE tablename = 'company_documents'
ORDER BY cmd, policyname;

