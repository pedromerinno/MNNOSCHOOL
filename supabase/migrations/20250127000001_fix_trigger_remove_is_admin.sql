-- =====================================================
-- CORREÇÃO: Atualizar trigger prevent_role_escalation
-- para remover referência a OLD.is_admin (coluna removida)
-- =====================================================
-- 
-- PROBLEMA: O trigger prevent_role_escalation ainda referencia
-- OLD.is_admin que não existe mais na tabela profiles
--
-- SOLUÇÃO: Remover verificação de is_admin, manter apenas super_admin
-- =====================================================

-- Corrigir função do trigger para remover referência a is_admin
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only super admins can change super_admin status
  -- is_admin foi removido de profiles, agora está em user_empresa
  IF (OLD.super_admin IS DISTINCT FROM NEW.super_admin) THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND super_admin = true
    ) THEN
      RAISE EXCEPTION 'Only super administrators can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.prevent_role_escalation() IS 'Previne escalação de privilégios. ATUALIZADO: Removida verificação de is_admin (agora em user_empresa)';

-- =====================================================
-- Corrigir funções SQL que ainda podem referenciar is_admin
-- =====================================================

-- Corrigir is_admin_secure para não usar is_admin de profiles
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_id uuid)
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
    WHERE id = user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND is_admin = true
  );
END;
$$;

-- Corrigir get_is_admin_secure para não usar is_admin de profiles
CREATE OR REPLACE FUNCTION public.get_is_admin_secure(user_id uuid)
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
    WHERE id = user_id AND super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de qualquer empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa
    WHERE user_id = user_id AND is_admin = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

COMMENT ON FUNCTION public.is_admin_secure(uuid) IS 'Verifica se um usuário é admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
COMMENT ON FUNCTION public.get_is_admin_secure(uuid) IS 'Obtém se um usuário é admin. ATUALIZADO: Usa user_empresa.is_admin em vez de profiles.is_admin.';
