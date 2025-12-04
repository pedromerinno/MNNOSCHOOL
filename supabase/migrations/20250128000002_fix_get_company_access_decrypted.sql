-- =====================================================
-- MIGRAÇÃO: Corrigir verificação de permissões em get_company_access_decrypted
-- =====================================================
-- 
-- A função estava verificando is_admin em profiles, mas is_admin foi movido para user_empresa
-- Agora usa is_admin_for_company que verifica corretamente
--
-- RISCO: BAIXO - Apenas corrige verificação de permissões
-- IMPACTO: ALTO - Corrige erro na página Senhas e Acessos
-- =====================================================

-- Function to get decrypted company access (admin only)
CREATE OR REPLACE FUNCTION public.get_company_access_decrypted(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  tool_name TEXT,
  username TEXT,
  password_decrypted TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  created_by UUID
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check authorization using the correct function that checks user_empresa
  IF NOT public.is_admin_for_company(p_company_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required for this company';
  END IF;
  
  -- Return decrypted data
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    CASE 
      WHEN ca.password_encrypted IS NOT NULL AND ca.encryption_key IS NOT NULL THEN
        public.decrypt_password(ca.password_encrypted, ca.encryption_key)
      ELSE ca.password -- Fallback to plaintext temporarily
    END as password_decrypted,
    ca.url,
    ca.notes,
    ca.created_at,
    ca.created_by
  FROM public.company_access ca
  WHERE ca.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_company_access_decrypted IS 'Retorna os itens de acesso da empresa com senhas descriptografadas. Requer que o usuário seja admin da empresa ou super admin.';




