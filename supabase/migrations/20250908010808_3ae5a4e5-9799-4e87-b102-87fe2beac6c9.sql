-- FIX FINAL SECURITY DEFINER FUNCTIONS: Update notification triggers and remaining functions

-- Update all notification trigger functions to include SET search_path = public
CREATE OR REPLACE FUNCTION public.create_notifications_for_company_notice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, company_id, title, content, type, related_id)
  SELECT 
    ue.user_id, 
    NEW.company_id, 
    NEW.title, 
    substring(NEW.content, 1, 100) || CASE WHEN length(NEW.content) > 100 THEN '...' ELSE '' END, 
    'notice', 
    NEW.id
  FROM 
    public.user_empresa ue
  WHERE 
    ue.empresa_id = NEW.company_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notifications_for_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, company_id, title, content, type, related_id)
  SELECT DISTINCT
    ue.user_id,
    cc.empresa_id,
    'Nova aula disponível',
    'Uma nova aula foi adicionada ao curso: ' || c.title,
    'lesson_created',
    NEW.id
  FROM 
    public.courses c
    JOIN public.company_courses cc ON c.id = cc.course_id
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
  WHERE 
    c.id = NEW.course_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notifications_for_company_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, company_id, title, content, type, related_id)
  SELECT 
    ue.user_id,
    NEW.company_id,
    'Novo acesso compartilhado',
    'Um novo acesso para ' || NEW.tool_name || ' foi compartilhado.',
    'access_created',
    NEW.id
  FROM 
    public.user_empresa ue
  WHERE 
    ue.empresa_id = NEW.company_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notifications_for_discussion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, company_id, title, content, type, related_id)
  SELECT 
    ue.user_id,
    NEW.company_id,
    'Nova discussão iniciada',
    'Uma nova discussão foi iniciada: ' || NEW.title,
    'discussion_created',
    NEW.id
  FROM 
    public.user_empresa ue
  WHERE 
    ue.empresa_id = NEW.company_id
    AND ue.user_id != NEW.author_id; -- Don't notify the author
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notifications_for_company_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir notificações para todos os usuários da empresa
  INSERT INTO public.user_notifications (user_id, company_id, title, content, type, related_id)
  SELECT 
    ue.user_id,
    cc.empresa_id,
    'Novo curso disponível',
    'O curso "' || NEW.title || '" foi adicionado.',
    'course_created',
    NEW.id
  FROM 
    public.company_courses cc
    JOIN public.user_empresa ue ON cc.empresa_id = ue.empresa_id
  WHERE 
    cc.course_id = NEW.id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_email_with_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando o email é atualizado na tabela auth.users, atualiza o perfil
  IF TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles 
    SET email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_email_matches_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_email text;
BEGIN
  -- Busca o email da autenticação
  SELECT email INTO auth_email 
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Se encontrou o email de auth e é diferente, força a sincronização
  IF auth_email IS NOT NULL AND (NEW.email IS NULL OR NEW.email != auth_email) THEN
    NEW.email := auth_email;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_all_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET email = auth_users.email,
      updated_at = now()
  FROM auth.users auth_users
  WHERE profiles.id = auth_users.id 
    AND (profiles.email IS NULL OR profiles.email != auth_users.email);
END;
$$;