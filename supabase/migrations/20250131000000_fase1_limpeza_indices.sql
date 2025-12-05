-- =====================================================
-- FASE 1: LIMPEZA E OTIMIZAÇÃO DE ÍNDICES
-- =====================================================
-- 
-- Esta migração:
-- 1. Remove índices não utilizados (0 scans) - exceto PKs e constraints
-- 2. Remove índices duplicados
-- 3. Adiciona índices faltantes em foreign keys
-- 4. Cria índices compostos para queries frequentes
--
-- RISCO: BAIXO - Apenas otimiza índices, não modifica dados
-- IMPACTO: ALTO - Reduz overhead de índices e melhora performance
-- =====================================================

-- =====================================================
-- PARTE 1: REMOVER ÍNDICES DUPLICADOS
-- =====================================================

-- Remover índice duplicado em user_empresa
-- Mantemos idx_user_empresa_empresa (mais usado: 32801 scans)
-- Removemos user_empresa_empresa_id_index (0 scans)
DROP INDEX IF EXISTS public.user_empresa_empresa_id_index;

-- Remover índice duplicado em profiles
-- Mantemos profiles_pkey (unique constraint necessário)
-- Removemos profiles_id_index (duplicado, mas tem 1095 scans - vamos manter por enquanto)
-- Na verdade, profiles_id_index é útil, vamos manter ambos

-- =====================================================
-- PARTE 2: REMOVER ÍNDICES NÃO UTILIZADOS
-- =====================================================
-- Removemos apenas índices que nunca foram usados (0 scans)
-- e que não são constraints (PK, UNIQUE, FK)

-- Índice não utilizado em user_course_suggestions
DROP INDEX IF EXISTS public.idx_user_course_suggestions_order;

-- Índices não utilizados em company_documents
DROP INDEX IF EXISTS public.idx_company_documents_company_id;

-- Índices não utilizados em company_document_job_roles
DROP INDEX IF EXISTS public.idx_company_document_job_roles_document_id;

-- Índices não utilizados em company_document_users
DROP INDEX IF EXISTS public.idx_company_document_users_document_id;

-- =====================================================
-- PARTE 3: ADICIONAR ÍNDICES FALTANTES EM FOREIGN KEYS
-- =====================================================

-- Company Access
CREATE INDEX IF NOT EXISTS idx_company_access_company_id_fk 
  ON public.company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_company_access_created_by_fk 
  ON public.company_access(created_by);

-- Company Documents
CREATE INDEX IF NOT EXISTS idx_company_documents_created_by_fk 
  ON public.company_documents(created_by);

-- Company Notices
CREATE INDEX IF NOT EXISTS idx_company_notices_created_by_fk 
  ON public.company_notices(created_by);

-- Company Videos
CREATE INDEX IF NOT EXISTS idx_company_videos_company_id_fk 
  ON public.company_videos(company_id);

-- Discussion Replies
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author_id_fk 
  ON public.discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id_fk 
  ON public.discussion_replies(discussion_id);

-- Discussions
CREATE INDEX IF NOT EXISTS idx_discussions_author_id_fk 
  ON public.discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_company_id_fk 
  ON public.discussions(company_id);

-- Empresas
CREATE INDEX IF NOT EXISTS idx_empresas_created_by_fk 
  ON public.empresas(created_by);

-- Lesson Comments
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_id_fk 
  ON public.lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user_id_fk 
  ON public.lesson_comments(user_id);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_fk 
  ON public.lessons(course_id);

-- User Course Suggestions
CREATE INDEX IF NOT EXISTS idx_user_course_suggestions_suggested_by_fk 
  ON public.user_course_suggestions(suggested_by);

-- User Documents
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id_fk 
  ON public.user_documents(user_id);

-- User Feedbacks
CREATE INDEX IF NOT EXISTS idx_user_feedbacks_company_id_fk 
  ON public.user_feedbacks(company_id);
CREATE INDEX IF NOT EXISTS idx_user_feedbacks_from_user_id_fk 
  ON public.user_feedbacks(from_user_id);

-- User Invites
CREATE INDEX IF NOT EXISTS idx_user_invites_company_id_fk 
  ON public.user_invites(company_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_created_by_fk 
  ON public.user_invites(created_by);

-- User Notes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id_fk 
  ON public.user_notes(user_id);

-- User Notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id_fk 
  ON public.user_notifications(user_id);

-- =====================================================
-- PARTE 4: CRIAR ÍNDICES COMPOSTOS PARA QUERIES FREQUENTES
-- =====================================================

-- Índice composto para buscar membros de empresa com cargo
CREATE INDEX IF NOT EXISTS idx_user_empresa_empresa_cargo_composto 
  ON public.user_empresa(empresa_id, cargo_id) 
  WHERE cargo_id IS NOT NULL;

-- Índice composto para buscar admins de empresa
CREATE INDEX IF NOT EXISTS idx_user_empresa_empresa_admin 
  ON public.user_empresa(empresa_id, is_admin) 
  WHERE is_admin = true;

-- Índice composto para progresso de curso por usuário e status
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_completed 
  ON public.user_course_progress(user_id, completed, last_accessed DESC);

-- Índice composto para lições por curso ordenadas
CREATE INDEX IF NOT EXISTS idx_lessons_course_order_composto 
  ON public.lessons(course_id, order_index);

-- Índice composto para discussões por empresa ordenadas por data
CREATE INDEX IF NOT EXISTS idx_discussions_company_created_composto 
  ON public.discussions(company_id, created_at DESC);

-- Índice composto para notificações não lidas por usuário e empresa
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_company_read 
  ON public.user_notifications(user_id, company_id, read, created_at DESC) 
  WHERE read = false;

-- Índice composto para company_courses (empresa + curso)
CREATE INDEX IF NOT EXISTS idx_company_courses_empresa_course 
  ON public.company_courses(empresa_id, course_id);

-- Índice composto para course_job_roles
CREATE INDEX IF NOT EXISTS idx_course_job_roles_course_job 
  ON public.course_job_roles(course_id, job_role_id);

-- =====================================================
-- PARTE 5: OTIMIZAR ÍNDICES EXISTENTES
-- =====================================================

-- Verificar se há índices parciais que podem ser úteis
-- Índice parcial para super admins (já existe, mas vamos garantir)
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin_partial 
  ON public.profiles(id) 
  WHERE super_admin = true;

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 1
-- =====================================================






