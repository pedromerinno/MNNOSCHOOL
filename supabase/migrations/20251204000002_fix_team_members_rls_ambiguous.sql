-- =====================================================
-- CORREÇÃO: Ambiguidade de is_admin em get_team_members
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- A função get_team_members usa a view view_team_members_view,
-- mas quando a política RLS é aplicada, pode haver ambiguidade
-- com a coluna is_admin quando há JOINs.
--
-- SOLUÇÃO:
-- Atualizar a função get_team_members para consultar diretamente
-- as tabelas com todas as colunas qualificadas, similar ao que
-- fizemos com get_company_users.
-- =====================================================

-- =====================================================
-- 1. CORRIGIR FUNÇÃO get_team_members
-- =====================================================
-- A função deve consultar diretamente as tabelas com todas
-- as colunas qualificadas para evitar ambiguidade

CREATE OR REPLACE FUNCTION public.get_team_members(_empresa_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  avatar text,
  super_admin boolean,
  created_at timestamptz,
  is_admin boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  has_permission boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Verificar se o usuário atual tem permissão para ver membros desta empresa
  -- Usar a função user_is_company_admin que bypassa RLS
  has_permission := public.user_is_company_admin(_empresa_id);
  
  -- Se não for admin da empresa, verificar se é membro da empresa
  -- (para permitir que usuários vejam outros membros da mesma empresa)
  IF NOT has_permission THEN
    -- Como esta função é SECURITY DEFINER, pode consultar user_empresa diretamente
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id
      AND empresa_id = _empresa_id
      LIMIT 1
    ) INTO has_permission;
  END IF;
  
  -- Se não tem permissão, retornar vazio
  IF NOT has_permission THEN
    RETURN;
  END IF;
  
  -- Retornar membros da equipe
  -- Como esta função é SECURITY DEFINER, ela bypassa RLS
  -- então pode consultar profiles e user_empresa diretamente
  -- IMPORTANTE: Qualificar TODAS as colunas para evitar ambiguidade
  -- Especialmente is_admin que existe em user_empresa
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.email,
    p.avatar,
    p.super_admin,
    p.created_at,
    ue.is_admin  -- Qualificado com alias ue para evitar ambiguidade
  FROM public.profiles p
  INNER JOIN public.user_empresa ue ON p.id = ue.user_id
  WHERE ue.empresa_id = _empresa_id
  ORDER BY p.display_name ASC;
END;
$$;

COMMENT ON FUNCTION public.get_team_members(uuid) IS 
'Função que retorna membros da equipe de uma empresa. Verifica se o usuário atual é admin da empresa ou membro antes de retornar os dados. Usa SECURITY DEFINER para bypassar RLS. Todas as colunas estão qualificadas para evitar ambiguidade.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================







