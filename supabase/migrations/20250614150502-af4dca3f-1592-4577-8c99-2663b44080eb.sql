
-- Primeiro remover a política que depende da função
DROP POLICY IF EXISTS "Admins can manage invites for their companies" ON public.user_invites;

-- Agora remover a função
DROP FUNCTION IF EXISTS public.is_user_admin_for_invites();

-- Criar função mais robusta para verificar permissões de admin
CREATE OR REPLACE FUNCTION public.is_user_admin_for_invites()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  user_is_admin boolean := false;
  user_is_super_admin boolean := false;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar as permissões do usuário
  SELECT 
    COALESCE(is_admin, false),
    COALESCE(super_admin, false)
  INTO user_is_admin, user_is_super_admin
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Retornar true se for admin ou super admin
  RETURN COALESCE(user_is_admin, false) OR COALESCE(user_is_super_admin, false);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN false;
END;
$$;

-- Recriar a política com a função atualizada
CREATE POLICY "Admins can manage invites for their companies" 
  ON public.user_invites 
  FOR ALL 
  USING (
    public.is_user_admin_for_invites() = true
  );

-- Garantir que a tabela user_invites tenha RLS habilitado
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;
