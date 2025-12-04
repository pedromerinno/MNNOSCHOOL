-- =====================================================
-- ANÁLISE DE PERFORMANCE: Tamanho das Tabelas e Políticas RLS
-- =====================================================
-- 
-- Este script analisa o tamanho (peso) das tabelas e a complexidade
-- das políticas RLS para identificar se a lentidão é causada por:
-- 1. Volume de dados (tabelas muito grandes)
-- 2. Complexidade das políticas RLS (muitas subqueries aninhadas)
--
-- IMPORTANTE: Este script é READ-ONLY, não modifica dados
-- Execute no Supabase SQL Editor ou via CLI
--
-- =====================================================

-- =====================================================
-- 1. ANÁLISE DE TAMANHO DAS TABELAS
-- =====================================================
-- Mostra tamanho total, tamanho dos dados, tamanho dos índices
-- e número de linhas para cada tabela

-- Query principal: Tamanho e estatísticas de todas as tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  pg_total_relation_size(schemaname||'.'||tablename) AS total_size_bytes,
  pg_relation_size(schemaname||'.'||tablename) AS table_size_bytes,
  (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 2. CONTAGEM DE LINHAS POR TABELA
-- =====================================================
-- Contagem precisa de linhas para as tabelas principais
-- Isso pode ser lento em tabelas muito grandes, mas é mais preciso

SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.profiles')) as total_size,
  pg_size_pretty(pg_relation_size('public.profiles')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.profiles') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.profiles

UNION ALL

SELECT 
  'user_empresa' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_empresa')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_empresa')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_empresa') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_empresa

UNION ALL

SELECT 
  'empresas' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.empresas')) as total_size,
  pg_size_pretty(pg_relation_size('public.empresas')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.empresas') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.empresas

UNION ALL

SELECT 
  'courses' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.courses')) as total_size,
  pg_size_pretty(pg_relation_size('public.courses')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.courses') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.courses

UNION ALL

SELECT 
  'lessons' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.lessons')) as total_size,
  pg_size_pretty(pg_relation_size('public.lessons')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.lessons') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.lessons

UNION ALL

SELECT 
  'user_lesson_progress' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_lesson_progress')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_lesson_progress')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_lesson_progress') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_lesson_progress

UNION ALL

SELECT 
  'user_course_progress' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_course_progress')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_course_progress')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_course_progress') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_course_progress

UNION ALL

SELECT 
  'user_documents' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_documents')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_documents')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_documents') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_documents

UNION ALL

SELECT 
  'company_documents' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.company_documents')) as total_size,
  pg_size_pretty(pg_relation_size('public.company_documents')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.company_documents') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.company_documents

UNION ALL

SELECT 
  'discussions' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.discussions')) as total_size,
  pg_size_pretty(pg_relation_size('public.discussions')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.discussions') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.discussions

UNION ALL

SELECT 
  'user_notifications' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_notifications')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_notifications')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_notifications') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_notifications

UNION ALL

SELECT 
  'company_courses' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.company_courses')) as total_size,
  pg_size_pretty(pg_relation_size('public.company_courses')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.company_courses') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.company_courses

UNION ALL

SELECT 
  'company_access' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.company_access')) as total_size,
  pg_size_pretty(pg_relation_size('public.company_access')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.company_access') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.company_access

UNION ALL

SELECT 
  'job_roles' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.job_roles')) as total_size,
  pg_size_pretty(pg_relation_size('public.job_roles')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.job_roles') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.job_roles

UNION ALL

SELECT 
  'discussion_replies' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.discussion_replies')) as total_size,
  pg_size_pretty(pg_relation_size('public.discussion_replies')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.discussion_replies') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.discussion_replies

UNION ALL

SELECT 
  'user_feedbacks' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.user_feedbacks')) as total_size,
  pg_size_pretty(pg_relation_size('public.user_feedbacks')) as table_size,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      pg_size_pretty(pg_relation_size('public.user_feedbacks') / COUNT(*))
    ELSE '0 bytes'
  END as avg_row_size
FROM public.user_feedbacks

ORDER BY row_count DESC;

-- =====================================================
-- 3. ANÁLISE DE POLÍTICAS RLS
-- =====================================================
-- Lista todas as políticas RLS ativas e sua complexidade

-- Resumo de políticas por tabela
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  COUNT(DISTINCT cmd) as operation_types,
  SUM(CASE WHEN qual IS NOT NULL THEN 1 ELSE 0 END) as policies_with_using,
  SUM(CASE WHEN with_check IS NOT NULL THEN 1 ELSE 0 END) as policies_with_check
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC, tablename;

-- Detalhes de todas as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_with_check,
  COALESCE(LENGTH(qual::text), 0) + COALESCE(LENGTH(with_check::text), 0) as policy_complexity_chars,
  CASE 
    WHEN COALESCE(LENGTH(qual::text), 0) + COALESCE(LENGTH(with_check::text), 0) > 1000 THEN 'High'
    WHEN COALESCE(LENGTH(qual::text), 0) + COALESCE(LENGTH(with_check::text), 0) > 500 THEN 'Medium'
    ELSE 'Low'
  END as complexity_level
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY policy_complexity_chars DESC, tablename, policyname;

-- Políticas mais complexas (com maior número de caracteres)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  COALESCE(LENGTH(qual::text), 0) + COALESCE(LENGTH(with_check::text), 0) as complexity_chars,
  LEFT(COALESCE(qual::text, ''), 200) || 
  CASE 
    WHEN LENGTH(COALESCE(qual::text, '')) > 200 THEN '...'
    ELSE ''
  END as using_preview,
  LEFT(COALESCE(with_check::text, ''), 200) || 
  CASE 
    WHEN LENGTH(COALESCE(with_check::text, '')) > 200 THEN '...'
    ELSE ''
  END as with_check_preview
FROM pg_policies
WHERE schemaname = 'public'
  AND (COALESCE(LENGTH(qual::text), 0) + COALESCE(LENGTH(with_check::text), 0)) > 500
ORDER BY complexity_chars DESC
LIMIT 20;

-- =====================================================
-- 4. ANÁLISE DE ÍNDICES
-- =====================================================
-- Verifica se há índices nas colunas usadas nas políticas RLS

-- Índices por tabela
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Contagem de índices por tabela
SELECT 
  schemaname,
  tablename,
  COUNT(*) as index_count,
  pg_size_pretty(SUM(pg_relation_size(indexname::regclass))) as total_indexes_size
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY SUM(pg_relation_size(indexname::regclass)) DESC;

-- =====================================================
-- 5. ANÁLISE DE PADRÕES RLS PROBLEMÁTICOS
-- =====================================================
-- Identifica políticas que podem estar causando lentidão

-- Políticas com múltiplos EXISTS (potencialmente lentas)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  (LENGTH(COALESCE(qual::text, '')) - LENGTH(REPLACE(COALESCE(qual::text, ''), 'EXISTS', ''))) / 6 as exists_count,
  (LENGTH(COALESCE(with_check::text, '')) - LENGTH(REPLACE(COALESCE(with_check::text, ''), 'EXISTS', ''))) / 6 as exists_count_with_check,
  (LENGTH(COALESCE(qual::text, '')) - LENGTH(REPLACE(COALESCE(qual::text, ''), 'EXISTS', ''))) / 6 +
  (LENGTH(COALESCE(with_check::text, '')) - LENGTH(REPLACE(COALESCE(with_check::text, ''), 'EXISTS', ''))) / 6 as total_exists_count
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual::text LIKE '%EXISTS%' OR 
    with_check::text LIKE '%EXISTS%'
  )
ORDER BY total_exists_count DESC;

-- Políticas que verificam super_admin (comum em todas as políticas)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual::text LIKE '%super_admin%' THEN 'Yes'
    ELSE 'No'
  END as checks_super_admin,
  CASE 
    WHEN qual::text LIKE '%user_empresa%' THEN 'Yes'
    ELSE 'No'
  END as checks_user_empresa,
  CASE 
    WHEN qual::text LIKE '%auth.uid()%' THEN 'Yes'
    ELSE 'No'
  END as checks_auth_uid
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 6. RESUMO E RECOMENDAÇÕES
-- =====================================================
-- Esta query fornece um resumo geral para análise rápida

-- Resumo geral de tamanho
SELECT 
  'Total Database Size' as metric,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) as value
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Total Tables Size' as metric,
  pg_size_pretty(SUM(pg_relation_size(schemaname||'.'||tablename))) as value
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Total Indexes Size' as metric,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))) as value
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Total RLS Policies' as metric,
  COUNT(*)::text as value
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Tables with RLS Enabled' as metric,
  COUNT(DISTINCT tablename)::text as value
FROM pg_policies
WHERE schemaname = 'public';

-- =====================================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- =====================================================
--
-- TAMANHO DAS TABELAS:
-- - Tabelas > 100MB podem precisar de otimização
-- - Tabelas > 1GB podem precisar de particionamento
-- - Tabelas de progresso (user_lesson_progress, user_course_progress) 
--   podem precisar de limpeza/arquivamento de dados antigos
--
-- POLÍTICAS RLS:
-- - Políticas com > 1000 caracteres são complexas
-- - Políticas com > 3 EXISTS aninhados podem ser lentas
-- - Verificações repetidas de super_admin em cada política podem ser otimizadas
--   criando uma função helper ou view materializada
--
-- ÍNDICES:
-- - Verifique se há índices nas colunas usadas nas políticas RLS:
--   - profiles.id, profiles.super_admin
--   - user_empresa.user_id, user_empresa.empresa_id, user_empresa.is_admin
--   - auth.uid() não precisa de índice (é uma função)
--
-- RECOMENDAÇÕES GERAIS:
-- 1. Se tabelas são grandes (> 100MB): Considere particionamento ou limpeza
-- 2. Se RLS é complexo: Considere criar funções helper ou views materializadas
-- 3. Se faltam índices: Adicione índices nas colunas usadas nas políticas RLS
-- 4. Se há muitas políticas: Considere consolidar políticas similares
--
-- =====================================================

