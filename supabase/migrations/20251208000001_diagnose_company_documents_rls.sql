-- Script de diagnóstico para verificar políticas RLS de company_documents
-- Execute este script para verificar se as políticas estão corretas

-- 1. Verificar todas as políticas RLS na tabela company_documents
SELECT 
  'Políticas RLS atuais:' as info,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'company_documents'
ORDER BY cmd, policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
  'RLS Status:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'company_documents';

-- 3. Verificar estrutura da tabela (campos obrigatórios)
SELECT 
  'Estrutura da tabela:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'company_documents'
ORDER BY ordinal_position;

-- 4. Verificar se a política de INSERT existe e está correta
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'company_documents' 
      AND cmd = 'INSERT' 
      AND policyname = 'company_documents_insert'
    ) THEN '✓ Política INSERT existe'
    ELSE '✗ Política INSERT NÃO existe'
  END as policy_status;

-- 5. Mostrar a definição completa da política INSERT
SELECT 
  'Definição da política INSERT:' as info,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'company_documents'
  AND pol.polname = 'company_documents_insert';

