-- =====================================================
-- OTIMIZAÇÃO DE POLÍTICAS RLS - FASE 2
-- Substitui auth.uid() por (select auth.uid()) para melhor performance
-- =====================================================
-- 
-- Esta migração otimiza políticas RLS substituindo chamadas diretas
-- a auth.uid() por (select auth.uid()), evitando reavaliação
-- desnecessária para cada linha.
--
-- RISCO: BAIXO - Apenas otimiza avaliação, não muda lógica
-- IMPACTO: ALTO - Queries com muitas linhas 10-50x mais rápidas
-- =====================================================

-- =====================================================
-- PROFILES - Tabela mais crítica
-- =====================================================

-- Otimizar: Users can read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

-- Otimizar: Users can view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

-- Otimizar: Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

-- Otimizar: Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

-- Otimizar: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id);

-- Otimizar: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id);

-- Otimizar: Allow users to update own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id);

-- Otimizar: Usuários podem atualizar seus próprios interesses
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios interesses" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seus próprios interesses"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Otimizar: Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (get_is_admin_secure((select auth.uid())) OR get_is_super_admin_secure((select auth.uid())));

-- Otimizar: Admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (get_is_admin_secure((select auth.uid())) OR get_is_super_admin_secure((select auth.uid())));

-- Otimizar: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_admin_secure((select auth.uid())));

-- =====================================================
-- USER_EMPRESA - Tabela crítica para relacionamentos
-- =====================================================

-- Otimizar: Users can view own company associations
DROP POLICY IF EXISTS "Users can view own company associations" ON public.user_empresa;
CREATE POLICY "Users can view own company associations"
ON public.user_empresa
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can view their own company relationships
DROP POLICY IF EXISTS "Users can view their own company relationships" ON public.user_empresa;
CREATE POLICY "Users can view their own company relationships"
ON public.user_empresa
FOR SELECT
USING (user_id = (select auth.uid()));

-- Otimizar: Users can view their own memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_empresa;
CREATE POLICY "Users can view their own memberships"
ON public.user_empresa
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can associate themselves to companies during onboarding
DROP POLICY IF EXISTS "Users can associate themselves to companies during onboarding" ON public.user_empresa;
CREATE POLICY "Users can associate themselves to companies during onboarding"
ON public.user_empresa
FOR INSERT
WITH CHECK (((select auth.uid()) = user_id) AND (is_admin = false));

-- Otimizar: Users can remove themselves from companies
DROP POLICY IF EXISTS "Users can remove themselves from companies" ON public.user_empresa;
CREATE POLICY "Users can remove themselves from companies"
ON public.user_empresa
FOR DELETE
USING ((select auth.uid()) = user_id);

-- Otimizar: Admins can insert company associations
DROP POLICY IF EXISTS "Admins can insert company associations" ON public.user_empresa;
CREATE POLICY "Admins can insert company associations"
ON public.user_empresa
FOR INSERT
WITH CHECK (is_admin((select auth.uid())));

-- Otimizar: Admins can delete company associations
DROP POLICY IF EXISTS "Admins can delete company associations" ON public.user_empresa;
CREATE POLICY "Admins can delete company associations"
ON public.user_empresa
FOR DELETE
USING (is_admin((select auth.uid())));

-- Otimizar: Admins can view all company associations
DROP POLICY IF EXISTS "Admins can view all company associations" ON public.user_empresa;
CREATE POLICY "Admins can view all company associations"
ON public.user_empresa
FOR SELECT
USING (is_admin((select auth.uid())));

-- Otimizar: Admins can manage user-company relationships
DROP POLICY IF EXISTS "Admins can manage user-company relationships" ON public.user_empresa;
CREATE POLICY "Admins can manage user-company relationships"
ON public.user_empresa
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
  )
);

-- =====================================================
-- DISCUSSIONS - Tabela de discussões
-- =====================================================

-- Otimizar: Allow users to create discussions
DROP POLICY IF EXISTS "Allow users to create discussions" ON public.discussions;
CREATE POLICY "Allow users to create discussions"
ON public.discussions
FOR INSERT
WITH CHECK ((select auth.uid()) = author_id);

-- Otimizar: Allow users to update own discussions
DROP POLICY IF EXISTS "Allow users to update own discussions" ON public.discussions;
CREATE POLICY "Allow users to update own discussions"
ON public.discussions
FOR UPDATE
USING ((select auth.uid()) = author_id);

-- Otimizar: Allow users to delete own discussions
DROP POLICY IF EXISTS "Allow users to delete own discussions" ON public.discussions;
CREATE POLICY "Allow users to delete own discussions"
ON public.discussions
FOR DELETE
USING ((select auth.uid()) = author_id);

-- Otimizar: Users can create company discussions
DROP POLICY IF EXISTS "Users can create company discussions" ON public.discussions;
CREATE POLICY "Users can create company discussions"
ON public.discussions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_empresa.user_id = (select auth.uid())
    AND user_empresa.empresa_id = discussions.company_id
  )
);

-- =====================================================
-- DISCUSSION REPLIES
-- =====================================================

-- Otimizar: Allow users to create replies
DROP POLICY IF EXISTS "Allow users to create replies" ON public.discussion_replies;
CREATE POLICY "Allow users to create replies"
ON public.discussion_replies
FOR INSERT
WITH CHECK ((select auth.uid()) = author_id);

-- Otimizar: Allow users to update own replies
DROP POLICY IF EXISTS "Allow users to update own replies" ON public.discussion_replies;
CREATE POLICY "Allow users to update own replies"
ON public.discussion_replies
FOR UPDATE
USING ((select auth.uid()) = author_id);

-- Otimizar: Allow users to delete own replies
DROP POLICY IF EXISTS "Allow users to delete own replies" ON public.discussion_replies;
CREATE POLICY "Allow users to delete own replies"
ON public.discussion_replies
FOR DELETE
USING ((select auth.uid()) = author_id);

-- Otimizar: Users can create company discussion replies
DROP POLICY IF EXISTS "Users can create company discussion replies" ON public.discussion_replies;
CREATE POLICY "Users can create company discussion replies"
ON public.discussion_replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_empresa.user_id = (select auth.uid())
    AND user_empresa.empresa_id = (
      SELECT company_id FROM discussions WHERE id = discussion_replies.discussion_id
    )
  )
);

-- =====================================================
-- LESSON COMMENTS
-- =====================================================

-- Otimizar: Users can create their own comments
DROP POLICY IF EXISTS "Users can create their own comments" ON public.lesson_comments;
CREATE POLICY "Users can create their own comments"
ON public.lesson_comments
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- Otimizar: Users can update their own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON public.lesson_comments;
CREATE POLICY "Users can update their own comments"
ON public.lesson_comments
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.lesson_comments;
CREATE POLICY "Users can delete their own comments"
ON public.lesson_comments
FOR DELETE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- USER COURSE PROGRESS
-- =====================================================

-- Otimizar: Users can manage their own course progress
DROP POLICY IF EXISTS "Users can manage their own course progress" ON public.user_course_progress;
CREATE POLICY "Users can manage their own course progress"
ON public.user_course_progress
FOR ALL
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- USER LESSON PROGRESS
-- =====================================================

-- Otimizar: Users can manage their own lesson progress
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can manage their own lesson progress"
ON public.user_lesson_progress
FOR ALL
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- USER DOCUMENTS
-- =====================================================

-- Otimizar: Users can view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
CREATE POLICY "Users can view their own documents"
ON public.user_documents
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can insert their own documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_documents;
CREATE POLICY "Users can insert their own documents"
ON public.user_documents
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- Otimizar: Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.user_documents;
CREATE POLICY "Users can delete their own documents"
ON public.user_documents
FOR DELETE
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can delete their own uploaded documents
DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON public.user_documents;
CREATE POLICY "Users can delete their own uploaded documents"
ON public.user_documents
FOR DELETE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- USER NOTES
-- =====================================================

-- Otimizar: Usuários podem criar suas próprias notas
DROP POLICY IF EXISTS "Usuários podem criar suas próprias notas" ON public.user_notes;
CREATE POLICY "Usuários podem criar suas próprias notas"
ON public.user_notes
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- Otimizar: Usuários podem ver suas próprias notas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notas" ON public.user_notes;
CREATE POLICY "Usuários podem ver suas próprias notas"
ON public.user_notes
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Usuários podem atualizar suas próprias notas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notas" ON public.user_notes;
CREATE POLICY "Usuários podem atualizar suas próprias notas"
ON public.user_notes
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- Otimizar: Usuários podem excluir suas próprias notas
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias notas" ON public.user_notes;
CREATE POLICY "Usuários podem excluir suas próprias notas"
ON public.user_notes
FOR DELETE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- USER FEEDBACKS
-- =====================================================

-- Otimizar: Users can update their own feedbacks
DROP POLICY IF EXISTS "Users can update their own feedbacks" ON public.user_feedbacks;
CREATE POLICY "Users can update their own feedbacks"
ON public.user_feedbacks
FOR UPDATE
USING ((select auth.uid()) = from_user_id);

-- Otimizar: Users can delete their own feedbacks
DROP POLICY IF EXISTS "Users can delete their own feedbacks" ON public.user_feedbacks;
CREATE POLICY "Users can delete their own feedbacks"
ON public.user_feedbacks
FOR DELETE
USING ((select auth.uid()) = from_user_id);

-- =====================================================
-- USER NOTIFICATIONS
-- =====================================================

-- Otimizar: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can update their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can update their own notifications"
ON public.user_notifications
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- USER INVITES (corrigido)
-- =====================================================

-- Otimizar: Users can check their own invites
DROP POLICY IF EXISTS "Users can check their own invites" ON public.user_invites;
CREATE POLICY "Users can check their own invites"
ON public.user_invites
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))::text);

-- =====================================================
-- USER ACCESS
-- =====================================================

-- Otimizar: Users can view their own access
DROP POLICY IF EXISTS "Users can view their own access" ON public.user_access;
CREATE POLICY "Users can view their own access"
ON public.user_access
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can create their own access
DROP POLICY IF EXISTS "Users can create their own access" ON public.user_access;
CREATE POLICY "Users can create their own access"
ON public.user_access
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- Otimizar: Users can update their own access
DROP POLICY IF EXISTS "Users can update their own access" ON public.user_access;
CREATE POLICY "Users can update their own access"
ON public.user_access
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- Otimizar: Users can delete their own access
DROP POLICY IF EXISTS "Users can delete their own access" ON public.user_access;
CREATE POLICY "Users can delete their own access"
ON public.user_access
FOR DELETE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- USER COURSE SUGGESTIONS
-- =====================================================

-- Otimizar: Users can view their own course suggestions
DROP POLICY IF EXISTS "Users can view their own course suggestions" ON public.user_course_suggestions;
CREATE POLICY "Users can view their own course suggestions"
ON public.user_course_suggestions
FOR SELECT
USING ((select auth.uid()) = suggested_by);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

