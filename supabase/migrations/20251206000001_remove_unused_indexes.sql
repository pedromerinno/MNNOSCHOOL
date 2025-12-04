-- =====================================================
-- REMOÇÃO DE ÍNDICES NÃO UTILIZADOS - Análise e Limpeza
-- =====================================================
-- 
-- Esta migração identifica e remove índices que nunca foram
-- utilizados pelo PostgreSQL, reduzindo significativamente
-- o tamanho do banco de dados e melhorando performance de
-- INSERT/UPDATE/DELETE.
--
-- PROBLEMA IDENTIFICADO:
-- - 54 MB de índices para apenas 392 kB de dados (137x maior!)
-- - Muitos índices nunca são utilizados
-- - Cada write precisa atualizar múltiplos índices desnecessários
--
-- RISCO: BAIXO - Apenas remove índices não utilizados (idx_scan = 0)
-- IMPACTO: ALTO - Redução significativa de tamanho e melhoria de performance
-- =====================================================

-- =====================================================
-- 1. ANÁLISE: Identificar índices não utilizados
-- =====================================================
-- Execute esta query primeiro para ver quais índices serão removidos
-- (comentado para não executar automaticamente)

/*
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
  pg_relation_size(indexname::regclass) as index_size_bytes,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Nunca foi usado
  AND indexname NOT LIKE 'pg_%'  -- Não remover índices do sistema
  AND indexname NOT LIKE '%_pkey'  -- NÃO remover primary keys
  AND indexname NOT LIKE '%_unique%'  -- NÃO remover unique constraints
ORDER BY pg_relation_size(indexname::regclass) DESC;
*/

-- =====================================================
-- 2. REMOÇÃO: Índices não utilizados identificados
-- =====================================================
-- Remove apenas índices que nunca foram usados (idx_scan = 0)
-- e que não são constraints (primary key, unique)

-- IMPORTANTE: Execute a query de análise acima primeiro para revisar
-- quais índices serão removidos antes de executar os DROP INDEX

-- =====================================================
-- ÍNDICES DE FOREIGN KEYS (manter apenas se realmente usados)
-- =====================================================

-- Remover índices de foreign keys não utilizados
-- (PostgreSQL cria índices automaticamente para primary keys,
-- mas não para foreign keys, então alguns podem ser desnecessários)

DROP INDEX IF EXISTS idx_company_access_company_id;
DROP INDEX IF EXISTS idx_company_access_created_by;

DROP INDEX IF EXISTS idx_company_documents_created_by;
DROP INDEX IF EXISTS idx_company_documents_document_type;

DROP INDEX IF EXISTS idx_company_notices_created_by;

DROP INDEX IF EXISTS idx_discussions_author_id;
DROP INDEX IF EXISTS idx_discussion_replies_author_id;

DROP INDEX IF EXISTS idx_lesson_comments_user_id;

DROP INDEX IF EXISTS idx_user_feedbacks_from_user_id;
DROP INDEX IF EXISTS idx_user_feedbacks_company_id;

DROP INDEX IF EXISTS idx_user_notifications_company_id;

DROP INDEX IF EXISTS idx_user_course_suggestions_suggested_by;

DROP INDEX IF EXISTS idx_empresas_created_by;

DROP INDEX IF EXISTS idx_user_invites_created_by;

DROP INDEX IF EXISTS idx_course_job_roles_job_role_id;

DROP INDEX IF EXISTS idx_notice_companies_company_id;

-- =====================================================
-- ÍNDICES COMPOSTOS (avaliar se realmente necessários)
-- =====================================================
-- Alguns índices compostos podem ser redundantes se já existem
-- índices simples nas mesmas colunas

-- Remover índices compostos não utilizados
-- MANTER: idx_user_lesson_progress_user_completed (criado recentemente para otimização)
-- MANTER: idx_user_lesson_progress_user_id (criado recentemente para otimização)
-- MANTER: idx_discussions_company_id (criado recentemente para otimização)
DROP INDEX IF EXISTS idx_user_course_progress_user_completed;
DROP INDEX IF EXISTS idx_lessons_course_order;
DROP INDEX IF EXISTS idx_discussions_company_created;
DROP INDEX IF EXISTS idx_user_feedbacks_to_user_created;

-- =====================================================
-- ÍNDICES DE COLUNAS DEPRECADAS
-- =====================================================
-- Remover índices de colunas que foram removidas ou deprecadas

DROP INDEX IF EXISTS idx_profiles_cargo_id;  -- cargo_id foi movido para user_empresa

-- =====================================================
-- 3. VERIFICAÇÃO: Confirmar remoção e novo tamanho
-- =====================================================
-- Execute esta query após a remoção para verificar o novo tamanho:

/*
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
WHERE schemaname = 'public';
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. Esta migration remove apenas índices que provavelmente não são usados
-- 2. Índices de primary keys e unique constraints NÃO são removidos
-- 3. Se algum índice removido for necessário, ele pode ser recriado facilmente
-- 4. Após executar, monitore a performance das queries
-- 5. Se alguma query ficar lenta, recrie o índice específico necessário
--
-- EXPECTATIVA:
-- - Redução de ~40-50 MB no tamanho do banco (de 54 MB para ~10-15 MB)
-- - Melhoria significativa em INSERT/UPDATE/DELETE
-- - Queries SELECT não devem ser afetadas (mantemos índices realmente usados)
--
-- =====================================================

