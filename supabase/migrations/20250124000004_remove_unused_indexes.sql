-- =====================================================
-- REMOÇÃO DE ÍNDICES NÃO UTILIZADOS - FASE 5
-- Remove índices identificados como não utilizados
-- =====================================================
-- 
-- Esta migração remove índices que foram identificados
-- como não utilizados pelo Supabase Advisor, reduzindo
-- overhead de manutenção e melhorando performance de
-- INSERT/UPDATE/DELETE.
--
-- RISCO: BAIXO - Apenas remove índices não utilizados
-- IMPACTO: MÉDIO - Reduz overhead de manutenção de índices
-- =====================================================

-- =====================================================
-- USER_INVITES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_invites_email;
DROP INDEX IF EXISTS idx_user_invites_company_id;
DROP INDEX IF EXISTS idx_user_invites_expires_at;
DROP INDEX IF EXISTS idx_user_invites_used;
DROP INDEX IF EXISTS idx_user_invites_created_by;

-- =====================================================
-- USER_COURSE_SUGGESTIONS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_course_suggestions_user_id;
DROP INDEX IF EXISTS idx_user_course_suggestions_company_id;
DROP INDEX IF EXISTS idx_user_course_suggestions_course_id;
DROP INDEX IF EXISTS idx_user_course_suggestions_suggested_by;

-- =====================================================
-- COMPANY_ACCESS - Remover índices não utilizados
-- (mantendo apenas se forem foreign keys críticas)
-- =====================================================
DROP INDEX IF EXISTS idx_company_access_company_id;
DROP INDEX IF EXISTS idx_company_access_created_by;

-- =====================================================
-- COMPANY_DOCUMENTS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_company_documents_created_by;
DROP INDEX IF EXISTS idx_company_documents_document_type;

-- =====================================================
-- COMPANY_NOTICES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_company_notices_created_by;

-- =====================================================
-- COMPANY_VIDEOS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_company_videos_company_id;

-- =====================================================
-- DISCUSSIONS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_discussions_company_id;
DROP INDEX IF EXISTS idx_discussions_author_id;
DROP INDEX IF EXISTS idx_discussions_company_created;

-- =====================================================
-- DISCUSSION_REPLIES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_discussion_replies_discussion_id;
DROP INDEX IF EXISTS idx_discussion_replies_author_id;

-- =====================================================
-- LESSONS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_lessons_course_id;
DROP INDEX IF EXISTS idx_lessons_course_order;

-- =====================================================
-- LESSON_COMMENTS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_lesson_comments_lesson_id;
DROP INDEX IF EXISTS idx_lesson_comments_user_id;

-- =====================================================
-- PROFILES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_profiles_cargo_id;

-- =====================================================
-- USER_COURSE_PROGRESS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_course_progress_course_id;
DROP INDEX IF EXISTS idx_user_course_progress_user_completed;

-- =====================================================
-- USER_LESSON_PROGRESS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_lesson_progress_lesson_id;

-- =====================================================
-- USER_DOCUMENTS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_documents_user_id;

-- =====================================================
-- USER_FEEDBACKS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_feedbacks_company_id;
DROP INDEX IF EXISTS idx_user_feedbacks_from_user_id;
DROP INDEX IF EXISTS idx_user_feedbacks_to_user_id;

-- =====================================================
-- USER_NOTIFICATIONS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_notifications_user_id;
DROP INDEX IF EXISTS idx_user_notifications_user_read;

-- =====================================================
-- USER_NOTES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_user_notes_user_id;

-- =====================================================
-- EMPRESAS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_empresas_created_by;

-- =====================================================
-- NOTICE_COMPANIES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_notice_companies_company_id;

-- =====================================================
-- COURSE_JOB_ROLES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_course_job_roles_job_role_id;

-- =====================================================
-- COMPANY_COURSES - Remover índices não utilizados
-- (cuidado: este pode ser foreign key, mas foi identificado como não usado)
-- =====================================================
DROP INDEX IF EXISTS idx_company_courses_course_id;

-- =====================================================
-- COMPANY_DOCUMENT_JOB_ROLES - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_company_document_job_roles_job_role_id;

-- =====================================================
-- COMPANY_DOCUMENT_USERS - Remover índices não utilizados
-- =====================================================
DROP INDEX IF EXISTS idx_company_document_users_user_id;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

