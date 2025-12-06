-- =====================================================
-- VALIDAÇÃO DE POLÍTICAS RLS
-- =====================================================
-- 
-- Este script valida se todas as políticas RLS foram
-- criadas corretamente após a refatoração.
--
-- Execute após aplicar as migrações de remoção e criação
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS AS POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '✓'
    WHEN cmd = 'INSERT' THEN '✓'
    WHEN cmd = 'UPDATE' THEN '✓'
    WHEN cmd = 'DELETE' THEN '✓'
    ELSE '?'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- 2. CONTAR POLÍTICAS POR TABELA
-- =====================================================
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 3. VERIFICAR TABELAS SEM POLÍTICAS (se houver)
-- =====================================================
SELECT 
  t.tablename,
  CASE 
    WHEN t.rowsecurity = true THEN 'RLS Enabled'
    ELSE 'RLS Disabled'
  END as rls_status,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE '_%'
GROUP BY t.tablename, t.rowsecurity
HAVING COUNT(p.policyname) = 0
ORDER BY t.tablename;

-- =====================================================
-- 4. VERIFICAR POLÍTICAS ESPERADAS POR TABELA
-- =====================================================
-- Tabelas que devem ter 4 políticas (SELECT, INSERT, UPDATE, DELETE)
WITH expected_policies AS (
  SELECT tablename, 4 as expected_count
  FROM (VALUES 
    ('profiles'),
    ('user_empresa'),
    ('user_invites'),
    ('empresas'),
    ('job_roles'),
    ('courses'),
    ('company_courses'),
    ('lessons'),
    ('course_job_roles'),
    ('user_course_progress'),
    ('user_lesson_progress'),
    ('user_course_suggestions'),
    ('user_documents'),
    ('company_documents'),
    ('company_document_users'),
    ('company_document_job_roles'),
    ('discussions'),
    ('discussion_replies'),
    ('user_access'),
    ('company_access'),
    ('user_notifications'),
    ('user_feedbacks'),
    ('user_notes'),
    ('company_notices'),
    ('notice_companies'),
    ('company_videos'),
    ('settings')
  ) AS tables(tablename)
)
SELECT 
  ep.tablename,
  ep.expected_count,
  COUNT(p.policyname) as actual_count,
  CASE 
    WHEN COUNT(p.policyname) = ep.expected_count THEN '✓ OK'
    WHEN COUNT(p.policyname) < ep.expected_count THEN '⚠ FALTANDO'
    ELSE '⚠ EXTRA'
  END as status
FROM expected_policies ep
LEFT JOIN pg_policies p ON ep.tablename = p.tablename AND p.schemaname = 'public'
GROUP BY ep.tablename, ep.expected_count
ORDER BY ep.tablename;

-- =====================================================
-- 5. VERIFICAR PADRÃO DE NOMENCLATURA
-- =====================================================
-- Políticas devem seguir o padrão: {tabela}_{operacao}
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN policyname = tablename || '_' || LOWER(cmd) THEN '✓ Padrão correto'
    ELSE '⚠ Nome fora do padrão'
  END as naming_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- =====================================================
-- 6. RESUMO GERAL
-- =====================================================
SELECT 
  'Total de tabelas com RLS' as metric,
  COUNT(DISTINCT tablename)::text as value
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total de políticas RLS' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Políticas SELECT' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public' AND cmd = 'SELECT'
UNION ALL
SELECT 
  'Políticas INSERT' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public' AND cmd = 'INSERT'
UNION ALL
SELECT 
  'Políticas UPDATE' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public' AND cmd = 'UPDATE'
UNION ALL
SELECT 
  'Políticas DELETE' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public' AND cmd = 'DELETE';

-- =====================================================
-- NOTAS
-- =====================================================
-- Se todas as verificações passarem:
-- ✓ Todas as tabelas têm políticas
-- ✓ Nomenclatura está correta
-- ✓ Contagem de políticas está correta
--
-- Se houver problemas:
-- ⚠ Verifique as tabelas sem políticas
-- ⚠ Verifique políticas com nomes fora do padrão
-- ⚠ Verifique contagens incorretas









