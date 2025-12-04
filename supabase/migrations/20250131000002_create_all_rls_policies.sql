-- =====================================================
-- CRIAÇÃO COMPLETA DE TODAS AS POLÍTICAS RLS
-- =====================================================
-- 
-- Este script cria TODAS as políticas RLS de forma organizada
-- e otimizada, seguindo a especificação completa.
--
-- ESTRATÉGIA:
-- - Verificações inline otimizadas (sem funções quando possível)
-- - Uso de índices existentes
-- - LIMIT 1 em todas as subqueries EXISTS
-- - Ordem: super_admin > próprio > admin empresa > usuário empresa
--
-- RISCO: BAIXO - Apenas cria políticas, não altera dados
-- IMPACTO: ALTO - Define toda a segurança do sistema
-- =====================================================

-- =====================================================
-- HELPER: Função para verificar super admin (otimizada)
-- =====================================================
-- Usar verificação inline direta é mais rápido, mas criamos
-- uma função helper para casos complexos se necessário

-- =====================================================
-- 1. AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

-- =====================================================
-- profiles
-- =====================================================
-- SELECT: Próprio perfil OU super admin OU admin vê usuários da empresa
CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
USING (
  -- Próprio perfil
  id = (SELECT auth.uid())
  OR
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa vê perfis de usuários da mesma empresa
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    AND EXISTS (
      SELECT 1 FROM public.user_empresa ue_user
      WHERE ue_user.user_id = profiles.id
      AND ue_user.empresa_id = ue_admin.empresa_id
      LIMIT 1
    )
    LIMIT 1
  )
);

-- INSERT: Apenas super admin
CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio perfil (exceto super_admin) OU super admin OU admin atualiza usuários da empresa (exceto super_admin)
CREATE POLICY "profiles_update"
ON public.profiles
FOR UPDATE
USING (
  -- Próprio perfil (mas não pode alterar super_admin)
  (id = (SELECT auth.uid()) AND (OLD.super_admin = NEW.super_admin OR NEW.super_admin IS NULL))
  OR
  -- Super admin pode atualizar tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa pode atualizar usuários da empresa (mas não pode alterar super_admin)
  (
    EXISTS (
      SELECT 1 FROM public.user_empresa ue_admin
      WHERE ue_admin.user_id = (SELECT auth.uid())
      AND ue_admin.is_admin = true
      AND EXISTS (
        SELECT 1 FROM public.user_empresa ue_user
        WHERE ue_user.user_id = profiles.id
        AND ue_user.empresa_id = ue_admin.empresa_id
        LIMIT 1
      )
      LIMIT 1
    )
    AND (OLD.super_admin = NEW.super_admin OR NEW.super_admin IS NULL)
  )
)
WITH CHECK (
  -- Mesmas condições do USING
  (id = (SELECT auth.uid()) AND (OLD.super_admin = NEW.super_admin OR NEW.super_admin IS NULL))
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM public.user_empresa ue_admin
      WHERE ue_admin.user_id = (SELECT auth.uid())
      AND ue_admin.is_admin = true
      AND EXISTS (
        SELECT 1 FROM public.user_empresa ue_user
        WHERE ue_user.user_id = profiles.id
        AND ue_user.empresa_id = ue_admin.empresa_id
        LIMIT 1
      )
      LIMIT 1
    )
    AND (OLD.super_admin = NEW.super_admin OR NEW.super_admin IS NULL)
  )
);

-- DELETE: Apenas super admin
CREATE POLICY "profiles_delete"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_empresa
-- =====================================================
-- SELECT: Próprio registro OU super admin OU admin vê da empresa
CREATE POLICY "user_empresa_select"
ON public.user_empresa
FOR SELECT
USING (
  -- Próprio registro
  user_id = (SELECT auth.uid())
  OR
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  -- Admin de empresa vê membros da empresa
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_admin
    WHERE ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.empresa_id = user_empresa.empresa_id
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "user_empresa_insert"
ON public.user_empresa
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa (mas não pode auto-promover)
CREATE POLICY "user_empresa_update"
ON public.user_empresa
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_empresa.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
)
WITH CHECK (
  -- Não pode auto-promover a admin
  (NEW.user_id != (SELECT auth.uid()) OR NEW.is_admin = OLD.is_admin OR NEW.is_admin = false)
  AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.super_admin = true
      LIMIT 1
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_empresa ue
      WHERE ue.user_id = (SELECT auth.uid())
      AND ue.empresa_id = NEW.empresa_id
      AND ue.is_admin = true
      LIMIT 1
    )
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "user_empresa_delete"
ON public.user_empresa
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_empresa.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_invites
-- =====================================================
-- SELECT: Super admin OU admin da empresa
CREATE POLICY "user_invites_select"
ON public.user_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_invites.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "user_invites_insert"
ON public.user_invites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "user_invites_update"
ON public.user_invites
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_invites.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "user_invites_delete"
ON public.user_invites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_invites.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 2. EMPRESAS
-- =====================================================

-- =====================================================
-- empresas
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "empresas_select"
ON public.empresas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = empresas.id
    LIMIT 1
  )
);

-- INSERT: Apenas super admin
CREATE POLICY "empresas_insert"
ON public.empresas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "empresas_update"
ON public.empresas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = empresas.id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Apenas super admin
CREATE POLICY "empresas_delete"
ON public.empresas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- job_roles
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "job_roles_select"
ON public.job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = job_roles.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "job_roles_insert"
ON public.job_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "job_roles_update"
ON public.job_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = job_roles.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "job_roles_delete"
ON public.job_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = job_roles.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 3. CURSOS E LIÇÕES
-- =====================================================

-- =====================================================
-- courses
-- =====================================================
-- SELECT: Super admin OU usuário via company_courses
CREATE POLICY "courses_select"
ON public.courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = courses.id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Apenas super admin
CREATE POLICY "courses_insert"
ON public.courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Apenas super admin
CREATE POLICY "courses_update"
ON public.courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- DELETE: Apenas super admin
CREATE POLICY "courses_delete"
ON public.courses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_courses
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_courses_select"
ON public.company_courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_courses.empresa_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_courses_insert"
ON public.company_courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_courses_update"
ON public.company_courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_courses.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_courses_delete"
ON public.company_courses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_courses.empresa_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- lessons
-- =====================================================
-- SELECT: Super admin OU usuário via course access
CREATE POLICY "lessons_select"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = lessons.course_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa (via course)
CREATE POLICY "lessons_insert"
ON public.lessons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = NEW.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa (via course)
CREATE POLICY "lessons_update"
ON public.lessons
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = lessons.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa (via course)
CREATE POLICY "lessons_delete"
ON public.lessons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = lessons.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- course_job_roles
-- =====================================================
-- SELECT: Super admin OU usuário via course access
CREATE POLICY "course_job_roles_select"
ON public.course_job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_job_roles.course_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa (via course)
CREATE POLICY "course_job_roles_insert"
ON public.course_job_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = NEW.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa (via course)
CREATE POLICY "course_job_roles_update"
ON public.course_job_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_job_roles.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa (via course)
CREATE POLICY "course_job_roles_delete"
ON public.course_job_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_courses cc
    INNER JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
    WHERE cc.course_id = course_job_roles.course_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_course_progress
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_course_progress_select"
ON public.user_course_progress
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_progress
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    INNER JOIN public.company_courses cc ON cc.empresa_id = ue_progress.empresa_id
    WHERE ue_progress.user_id = user_course_progress.user_id
    AND cc.course_id = user_course_progress.course_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_course_progress_insert"
ON public.user_course_progress
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_progress
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    INNER JOIN public.company_courses cc ON cc.empresa_id = ue_progress.empresa_id
    WHERE ue_progress.user_id = NEW.user_id
    AND cc.course_id = NEW.course_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_course_progress_update"
ON public.user_course_progress
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue_progress
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    INNER JOIN public.company_courses cc ON cc.empresa_id = ue_progress.empresa_id
    WHERE ue_progress.user_id = user_course_progress.user_id
    AND cc.course_id = user_course_progress.course_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_course_progress_delete"
ON public.user_course_progress
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_lesson_progress
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_lesson_progress_select"
ON public.user_lesson_progress
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.lessons l
    INNER JOIN public.company_courses cc ON cc.course_id = l.course_id
    INNER JOIN public.user_empresa ue_progress ON cc.empresa_id = ue_progress.empresa_id
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    WHERE l.id = user_lesson_progress.lesson_id
    AND ue_progress.user_id = user_lesson_progress.user_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_lesson_progress_insert"
ON public.user_lesson_progress
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.lessons l
    INNER JOIN public.company_courses cc ON cc.course_id = l.course_id
    INNER JOIN public.user_empresa ue_progress ON cc.empresa_id = ue_progress.empresa_id
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    WHERE l.id = NEW.lesson_id
    AND ue_progress.user_id = NEW.user_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_lesson_progress_update"
ON public.user_lesson_progress
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.lessons l
    INNER JOIN public.company_courses cc ON cc.course_id = l.course_id
    INNER JOIN public.user_empresa ue_progress ON cc.empresa_id = ue_progress.empresa_id
    INNER JOIN public.user_empresa ue_admin ON ue_progress.empresa_id = ue_admin.empresa_id
    WHERE l.id = user_lesson_progress.lesson_id
    AND ue_progress.user_id = user_lesson_progress.user_id
    AND ue_admin.user_id = (SELECT auth.uid())
    AND ue_admin.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_lesson_progress_delete"
ON public.user_lesson_progress
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_course_suggestions
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_course_suggestions_select"
ON public.user_course_suggestions
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_course_suggestions.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin
CREATE POLICY "user_course_suggestions_insert"
ON public.user_course_suggestions
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin
CREATE POLICY "user_course_suggestions_update"
ON public.user_course_suggestions
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_course_suggestions_delete"
ON public.user_course_suggestions
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 4. DOCUMENTOS
-- =====================================================

-- =====================================================
-- user_documents
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_documents_select"
ON public.user_documents
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_documents.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_documents_insert"
ON public.user_documents
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_documents_update"
ON public.user_documents
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_documents.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_documents_delete"
ON public.user_documents
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_documents.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_documents
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_documents_select"
ON public.company_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_documents.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_documents_insert"
ON public.company_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_documents_update"
ON public.company_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_documents.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_documents_delete"
ON public.company_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_documents.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_document_users
-- =====================================================
-- SELECT: Super admin OU admin da empresa OU usuário se estiver na lista
CREATE POLICY "company_document_users_select"
ON public.company_document_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_users.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
  OR
  user_id = (SELECT auth.uid())
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_document_users_insert"
ON public.company_document_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = NEW.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_document_users_update"
ON public.company_document_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_users.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_document_users_delete"
ON public.company_document_users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_users.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_document_job_roles
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_document_job_roles_select"
ON public.company_document_job_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_document_job_roles_insert"
ON public.company_document_job_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = NEW.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_document_job_roles_update"
ON public.company_document_job_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_document_job_roles_delete"
ON public.company_document_job_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_documents cd
    INNER JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = company_document_job_roles.company_document_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 5. COMUNIDADE
-- =====================================================

-- =====================================================
-- discussions
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "discussions_select"
ON public.discussions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = discussions.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU usuário da empresa
CREATE POLICY "discussions_insert"
ON public.discussions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "discussions_update"
ON public.discussions
FOR UPDATE
USING (
  author_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = discussions.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin OU admin da empresa
CREATE POLICY "discussions_delete"
ON public.discussions
FOR DELETE
USING (
  author_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = discussions.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- discussion_replies
-- =====================================================
-- SELECT: Super admin OU usuário da empresa (via discussion)
CREATE POLICY "discussion_replies_select"
ON public.discussion_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.discussions d
    INNER JOIN public.user_empresa ue ON d.company_id = ue.empresa_id
    WHERE d.id = discussion_replies.discussion_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Super admin OU usuário da empresa (via discussion)
CREATE POLICY "discussion_replies_insert"
ON public.discussion_replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.discussions d
    INNER JOIN public.user_empresa ue ON d.company_id = ue.empresa_id
    WHERE d.id = NEW.discussion_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa (via discussion)
CREATE POLICY "discussion_replies_update"
ON public.discussion_replies
FOR UPDATE
USING (
  author_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.discussions d
    INNER JOIN public.user_empresa ue ON d.company_id = ue.empresa_id
    WHERE d.id = discussion_replies.discussion_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin OU admin da empresa (via discussion)
CREATE POLICY "discussion_replies_delete"
ON public.discussion_replies
FOR DELETE
USING (
  author_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.discussions d
    INNER JOIN public.user_empresa ue ON d.company_id = ue.empresa_id
    WHERE d.id = discussion_replies.discussion_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 6. ACESSOS
-- =====================================================

-- =====================================================
-- user_access
-- =====================================================
-- SELECT: Apenas próprio (privacidade)
CREATE POLICY "user_access_select"
ON public.user_access
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin
CREATE POLICY "user_access_insert"
ON public.user_access
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin
CREATE POLICY "user_access_update"
ON public.user_access
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_access_delete"
ON public.user_access
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_access
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_access_select"
ON public.company_access
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_access.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_access_insert"
ON public.company_access
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_access_update"
ON public.company_access
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_access.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_access_delete"
ON public.company_access
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_access.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 7. NOTIFICAÇÕES E FEEDBACK
-- =====================================================

-- =====================================================
-- user_notifications
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_notifications_select"
ON public.user_notifications
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_notifications.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "user_notifications_insert"
ON public.user_notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_notifications_update"
ON public.user_notifications
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_notifications.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_notifications_delete"
ON public.user_notifications
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_feedbacks
-- =====================================================
-- SELECT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_feedbacks_select"
ON public.user_feedbacks
FOR SELECT
USING (
  from_user_id = (SELECT auth.uid())
  OR
  to_user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_feedbacks.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_feedbacks_insert"
ON public.user_feedbacks
FOR INSERT
WITH CHECK (
  from_user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin OU admin da empresa
CREATE POLICY "user_feedbacks_update"
ON public.user_feedbacks
FOR UPDATE
USING (
  from_user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = user_feedbacks.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_feedbacks_delete"
ON public.user_feedbacks
FOR DELETE
USING (
  from_user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- user_notes
-- =====================================================
-- SELECT: Apenas próprio (privacidade)
CREATE POLICY "user_notes_select"
ON public.user_notes
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- INSERT: Próprio OU super admin
CREATE POLICY "user_notes_insert"
ON public.user_notes
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Próprio OU super admin
CREATE POLICY "user_notes_update"
ON public.user_notes
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- DELETE: Próprio OU super admin
CREATE POLICY "user_notes_delete"
ON public.user_notes
FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 8. AVISOS E VÍDEOS
-- =====================================================

-- =====================================================
-- company_notices
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_notices_select"
ON public.company_notices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_notices.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_notices_insert"
ON public.company_notices
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_notices_update"
ON public.company_notices
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_notices.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_notices_delete"
ON public.company_notices
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_notices.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- notice_companies
-- =====================================================
-- SELECT: Super admin OU usuário da empresa (via notice)
CREATE POLICY "notice_companies_select"
ON public.notice_companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_notices cn
    INNER JOIN public.user_empresa ue ON cn.company_id = ue.empresa_id
    WHERE cn.id = notice_companies.notice_id
    AND ue.user_id = (SELECT auth.uid())
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa (via notice)
CREATE POLICY "notice_companies_insert"
ON public.notice_companies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_notices cn
    INNER JOIN public.user_empresa ue ON cn.company_id = ue.empresa_id
    WHERE cn.id = NEW.notice_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa (via notice)
CREATE POLICY "notice_companies_update"
ON public.notice_companies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_notices cn
    INNER JOIN public.user_empresa ue ON cn.company_id = ue.empresa_id
    WHERE cn.id = notice_companies.notice_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa (via notice)
CREATE POLICY "notice_companies_delete"
ON public.notice_companies
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_notices cn
    INNER JOIN public.user_empresa ue ON cn.company_id = ue.empresa_id
    WHERE cn.id = notice_companies.notice_id
    AND ue.user_id = (SELECT auth.uid())
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- company_videos
-- =====================================================
-- SELECT: Super admin OU usuário da empresa
CREATE POLICY "company_videos_select"
ON public.company_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_videos.company_id
    LIMIT 1
  )
);

-- INSERT: Super admin OU admin da empresa
CREATE POLICY "company_videos_insert"
ON public.company_videos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = NEW.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- UPDATE: Super admin OU admin da empresa
CREATE POLICY "company_videos_update"
ON public.company_videos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_videos.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- DELETE: Super admin OU admin da empresa
CREATE POLICY "company_videos_delete"
ON public.company_videos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = (SELECT auth.uid())
    AND ue.empresa_id = company_videos.company_id
    AND ue.is_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- 9. CONFIGURAÇÕES
-- =====================================================

-- =====================================================
-- settings
-- =====================================================
-- SELECT: Apenas super admin
CREATE POLICY "settings_select"
ON public.settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- INSERT: Apenas super admin
CREATE POLICY "settings_insert"
ON public.settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- UPDATE: Apenas super admin
CREATE POLICY "settings_update"
ON public.settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- DELETE: Apenas super admin
CREATE POLICY "settings_delete"
ON public.settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND p.super_admin = true
    LIMIT 1
  )
);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute esta query para verificar todas as políticas criadas:
-- SELECT 
--   schemaname, 
--   tablename, 
--   policyname,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

