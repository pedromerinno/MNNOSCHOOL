
-- Função para sincronizar email do perfil com email de autenticação
CREATE OR REPLACE FUNCTION public.sync_profile_email_with_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger para sincronizar email quando atualizado na autenticação
DROP TRIGGER IF EXISTS sync_auth_email_to_profile ON auth.users;
CREATE TRIGGER sync_auth_email_to_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email_with_auth();

-- Função para garantir que o email do perfil seja sempre igual ao da autenticação
CREATE OR REPLACE FUNCTION public.ensure_profile_email_matches_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger para garantir sincronização no INSERT e UPDATE do perfil
DROP TRIGGER IF EXISTS ensure_profile_email_sync ON public.profiles;
CREATE TRIGGER ensure_profile_email_sync
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_email_matches_auth();

-- Função para sincronizar todos os emails existentes
CREATE OR REPLACE FUNCTION public.sync_all_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Executa a sincronização inicial para todos os perfis existentes
SELECT public.sync_all_profile_emails();
