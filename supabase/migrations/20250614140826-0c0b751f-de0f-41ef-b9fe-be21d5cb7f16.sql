
-- Criar função para excluir usuário com segurança
CREATE OR REPLACE FUNCTION public.delete_user_safely(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  is_super_admin boolean;
  is_admin_user boolean;
  target_is_super_admin boolean;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário atual existe e suas permissões
  SELECT 
    COALESCE(super_admin, false),
    COALESCE(is_admin, false)
  INTO is_super_admin, is_admin_user
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Verificar se o usuário alvo é super admin
  SELECT COALESCE(super_admin, false)
  INTO target_is_super_admin
  FROM profiles
  WHERE id = target_user_id;
  
  -- Regras de autorização:
  -- 1. Apenas super admins e admins podem excluir usuários
  -- 2. Admins não podem excluir super admins
  -- 3. Usuários não podem se excluir
  IF NOT (is_super_admin OR is_admin_user) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários';
  END IF;
  
  IF is_admin_user AND NOT is_super_admin AND target_is_super_admin THEN
    RAISE EXCEPTION 'Acesso negado: administradores não podem excluir super administradores';
  END IF;
  
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Não é possível excluir seu próprio usuário';
  END IF;
  
  -- Excluir dados relacionados primeiro (em ordem de dependência)
  DELETE FROM user_notifications WHERE user_id = target_user_id;
  DELETE FROM user_feedbacks WHERE from_user_id = target_user_id OR to_user_id = target_user_id;
  DELETE FROM user_documents WHERE user_id = target_user_id;
  DELETE FROM user_notes WHERE user_id = target_user_id;
  DELETE FROM user_access WHERE user_id = target_user_id;
  DELETE FROM user_lesson_progress WHERE user_id = target_user_id;
  DELETE FROM user_course_progress WHERE user_id = target_user_id;
  DELETE FROM lesson_comments WHERE user_id = target_user_id;
  DELETE FROM discussion_replies WHERE author_id = target_user_id;
  DELETE FROM discussions WHERE author_id = target_user_id;
  DELETE FROM user_empresa WHERE user_id = target_user_id;
  
  -- Excluir o perfil
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Excluir o usuário da tabela auth.users (isso deve ser feito por último)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao excluir usuário: %', SQLERRM;
END;
$$;
