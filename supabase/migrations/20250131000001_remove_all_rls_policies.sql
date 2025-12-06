-- =====================================================
-- REMOÇÃO COMPLETA DE TODAS AS POLÍTICAS RLS
-- =====================================================
-- 
-- Este script remove TODAS as políticas RLS existentes
-- para permitir uma refatoração completa e limpa.
--
-- IMPORTANTE:
-- - RLS permanece HABILITADO nas tabelas
-- - Apenas as políticas são removidas
-- - Execute o script de criação imediatamente após este
--
-- RISCO: ALTO se executado sem o script de criação
-- IMPACTO: Todas as políticas serão removidas
-- =====================================================

-- =====================================================
-- 1. AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_lightweight" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_lightweight" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_lightweight" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios interesses" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins see users from their companies" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "All acess" ON public.profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to view all profiles" ON public.profiles;

-- user_empresa
DROP POLICY IF EXISTS "user_empresa_select_lightweight" ON public.user_empresa;
DROP POLICY IF EXISTS "user_empresa_insert_lightweight" ON public.user_empresa;
DROP POLICY IF EXISTS "user_empresa_update_lightweight" ON public.user_empresa;
DROP POLICY IF EXISTS "user_empresa_delete_lightweight" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view own company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view their own company relationships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can associate themselves to companies during onboarding" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can remove themselves from companies" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can insert company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can delete company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can view all company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can manage user-company relationships" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can manage memberships for their companies" ON public.user_empresa;
DROP POLICY IF EXISTS "Super admins and company admins can manage memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view own memberships, admins can view company memberships" ON public.user_empresa;
DROP POLICY IF EXISTS "Admins can view memberships for their companies" ON public.user_empresa;
DROP POLICY IF EXISTS "Allow all authenticated users to view all user_empresa" ON public.user_empresa;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar todas as relações usu" ON public.user_empresa;
DROP POLICY IF EXISTS "Allow users to insert their own relationships or admin can inse" ON public.user_empresa;
DROP POLICY IF EXISTS "Allow users to delete their own relationships or admin can dele" ON public.user_empresa;

-- user_invites
DROP POLICY IF EXISTS "Admins can manage invites" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can view invites" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can update invites" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can delete invites" ON public.user_invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON public.user_invites;

-- =====================================================
-- 2. EMPRESAS
-- =====================================================

-- empresas
DROP POLICY IF EXISTS "Admin or super admin can see companies" ON public.empresas;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.empresas;
DROP POLICY IF EXISTS "Admins can update companies" ON public.empresas;
DROP POLICY IF EXISTS "Regular admins can manage their companies" ON public.empresas;
DROP POLICY IF EXISTS "Super admins can see all companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.empresas;
DROP POLICY IF EXISTS "Allow admins to update empresas" ON public.empresas;
DROP POLICY IF EXISTS "Allow admins to delete empresas" ON public.empresas;
DROP POLICY IF EXISTS "Allow admins to insert empresas" ON public.empresas;

-- job_roles
DROP POLICY IF EXISTS "Allow admins to manage job_roles" ON public.job_roles;
DROP POLICY IF EXISTS "Admins can manage job roles" ON public.job_roles;
DROP POLICY IF EXISTS "Users can view job roles for their companies" ON public.job_roles;
DROP POLICY IF EXISTS "Admins podem gerenciar cargos" ON public.job_roles;

-- =====================================================
-- 3. CURSOS E LIÇÕES
-- =====================================================

-- courses
DROP POLICY IF EXISTS "Admin or super admin can see all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view courses from their companies or if they are admi" ON public.courses;

-- company_courses
DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;
DROP POLICY IF EXISTS "Control course-company associations" ON public.company_courses;
DROP POLICY IF EXISTS "Users can view company_courses they belong to or if admin" ON public.company_courses;

-- lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can view lessons from courses they have access to" ON public.lessons;
DROP POLICY IF EXISTS "Users can view lessons" ON public.lessons;

-- course_job_roles
DROP POLICY IF EXISTS "Admins can manage course job roles" ON public.course_job_roles;
DROP POLICY IF EXISTS "Users can view course job roles" ON public.course_job_roles;

-- user_course_progress
DROP POLICY IF EXISTS "Users can manage their own course progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Admins can view course progress" ON public.user_course_progress;

-- user_lesson_progress
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Admins can view lesson progress" ON public.user_lesson_progress;

-- user_course_suggestions
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.user_course_suggestions;
DROP POLICY IF EXISTS "Admins can manage suggestions" ON public.user_course_suggestions;

-- =====================================================
-- 4. DOCUMENTOS
-- =====================================================

-- user_documents
DROP POLICY IF EXISTS "Users can manage their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_documents;
DROP POLICY IF EXISTS "Admins can manage company user documents" ON public.user_documents;

-- company_documents
DROP POLICY IF EXISTS "Admins can delete company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Admins can update company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Users can view company documents from their companies" ON public.company_documents;
DROP POLICY IF EXISTS "Admins can manage company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Users can view company documents" ON public.company_documents;

-- company_document_users
DROP POLICY IF EXISTS "Admins can manage document users" ON public.company_document_users;
DROP POLICY IF EXISTS "Users can view their document access" ON public.company_document_users;

-- company_document_job_roles
DROP POLICY IF EXISTS "Admins can manage document job roles" ON public.company_document_job_roles;
DROP POLICY IF EXISTS "Users can view document job roles" ON public.company_document_job_roles;

-- =====================================================
-- 5. COMUNIDADE
-- =====================================================

-- discussions
DROP POLICY IF EXISTS "Users can view company discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can create discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
DROP POLICY IF EXISTS "Admins can manage discussions" ON public.discussions;

-- discussion_replies
DROP POLICY IF EXISTS "Users can view replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can create replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Admins can manage replies" ON public.discussion_replies;

-- =====================================================
-- 6. ACESSOS
-- =====================================================

-- user_access
DROP POLICY IF EXISTS "Users can view their own access" ON public.user_access;
DROP POLICY IF EXISTS "Users can create their own access" ON public.user_access;
DROP POLICY IF EXISTS "Users can update their own access" ON public.user_access;
DROP POLICY IF EXISTS "Users can delete their own access" ON public.user_access;

-- company_access
DROP POLICY IF EXISTS "Administrators can manage all access data" ON public.company_access;
DROP POLICY IF EXISTS "Admins can create company access" ON public.company_access;
DROP POLICY IF EXISTS "Admins can delete company access" ON public.company_access;
DROP POLICY IF EXISTS "Admins can update company access" ON public.company_access;
DROP POLICY IF EXISTS "Users can view company access if related to company" ON public.company_access;
DROP POLICY IF EXISTS "Users can view company access where they belong" ON public.company_access;

-- =====================================================
-- 7. NOTIFICAÇÕES E FEEDBACK
-- =====================================================

-- user_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can view company notifications" ON public.user_notifications;

-- user_feedbacks
DROP POLICY IF EXISTS "Users can view feedbacks" ON public.user_feedbacks;
DROP POLICY IF EXISTS "Users can create feedbacks" ON public.user_feedbacks;
DROP POLICY IF EXISTS "Users can update their own feedbacks" ON public.user_feedbacks;
DROP POLICY IF EXISTS "Admins can manage feedbacks" ON public.user_feedbacks;

-- user_notes
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.user_notes;

-- =====================================================
-- 8. AVISOS E VÍDEOS
-- =====================================================

-- company_notices
DROP POLICY IF EXISTS "Admins can delete company notices" ON public.company_notices;
DROP POLICY IF EXISTS "Admins can update company notices" ON public.company_notices;
DROP POLICY IF EXISTS "Users can view company notices" ON public.company_notices;
DROP POLICY IF EXISTS "Admins can manage company notices" ON public.company_notices;
DROP POLICY IF EXISTS "Users can view notices" ON public.company_notices;

-- notice_companies
DROP POLICY IF EXISTS "Admins can manage notice companies" ON public.notice_companies;
DROP POLICY IF EXISTS "Users can view notice companies" ON public.notice_companies;

-- company_videos
DROP POLICY IF EXISTS "Only admins can modify company videos" ON public.company_videos;
DROP POLICY IF EXISTS "Users can view company videos" ON public.company_videos;
DROP POLICY IF EXISTS "Admins can manage company videos" ON public.company_videos;

-- =====================================================
-- 9. CONFIGURAÇÕES
-- =====================================================

-- settings
DROP POLICY IF EXISTS "Only super admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Super admins can manage settings" ON public.settings;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute esta query para verificar se todas as políticas foram removidas:
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;









