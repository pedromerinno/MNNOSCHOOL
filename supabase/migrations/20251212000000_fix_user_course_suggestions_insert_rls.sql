-- Corrigir função is_user_admin_or_super_admin() que ainda referencia profiles.is_admin (removida)
-- A função precisa usar user_empresa.is_admin em vez de profiles.is_admin

CREATE OR REPLACE FUNCTION public.is_user_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Super admin tem acesso global
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Corrigir políticas RLS para permitir que admins criem e editem sugestões de curso para outros usuários
-- As políticas atuais só permitem que o próprio usuário crie/edite sugestões para si mesmo ou super admins
-- Precisamos permitir que admins também possam criar e editar sugestões

-- Corrigir política INSERT
DROP POLICY IF EXISTS "user_course_suggestions_insert" ON public.user_course_suggestions;
DROP POLICY IF EXISTS "Admins can create course suggestions" ON public.user_course_suggestions;

-- Criar política INSERT que permite:
-- 1. Admins e super admins criarem sugestões para qualquer usuário
-- 2. Usuários criarem sugestões para si mesmos (caso necessário)
CREATE POLICY "user_course_suggestions_insert"
ON public.user_course_suggestions
FOR INSERT
WITH CHECK (
  -- Permite admins e super admins criarem sugestões
  public.is_user_admin_or_super_admin()
  OR
  -- Permite usuários criarem sugestões para si mesmos (caso necessário)
  user_id = auth.uid()
);

-- Corrigir política UPDATE
DROP POLICY IF EXISTS "user_course_suggestions_update" ON public.user_course_suggestions;
DROP POLICY IF EXISTS "Admins can update course suggestions" ON public.user_course_suggestions;

-- Criar política UPDATE que permite:
-- 1. Admins e super admins editarem qualquer sugestão
-- 2. Usuários editarem suas próprias sugestões (caso necessário)
CREATE POLICY "user_course_suggestions_update"
ON public.user_course_suggestions
FOR UPDATE
USING (
  -- Permite admins e super admins editarem sugestões
  public.is_user_admin_or_super_admin()
  OR
  -- Permite usuários editarem suas próprias sugestões (caso necessário)
  user_id = auth.uid()
);

