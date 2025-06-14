
-- Remover a função problemática e recriar sem referências a auth.users
DROP FUNCTION IF EXISTS public.is_user_admin_for_invites();

-- Criar função mais simples que só verifica permissões na tabela profiles
CREATE OR REPLACE FUNCTION public.is_user_admin_for_invites()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_is_admin boolean;
  user_is_super_admin boolean;
BEGIN
  SELECT 
    COALESCE(is_admin, false),
    COALESCE(super_admin, false)
  INTO user_is_admin, user_is_super_admin
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_is_admin, false) OR COALESCE(user_is_super_admin, false);
END;
$$;

-- Atualizar a política para ser mais específica
DROP POLICY IF EXISTS "Admins can manage invites for their companies" ON public.user_invites;

CREATE POLICY "Admins can manage invites for their companies" 
  ON public.user_invites 
  FOR ALL 
  USING (
    public.is_user_admin_for_invites()
  );
