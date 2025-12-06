-- =====================================================
-- RENOMEAR VIEWS COM PREFIXO view_
-- =====================================================
-- 
-- Esta migração renomeia todas as views para incluir
-- o prefixo "view_" seguindo o padrão de nomenclatura
-- do projeto.
--
-- OBJETIVO: Padronizar nomenclatura de views
-- RISCO: BAIXO - Apenas renomeia views e atualiza funções
-- IMPACTO: MÉDIO - Requer atualização de código que usa as views
-- =====================================================

-- =====================================================
-- 1. RENOMEAR company_users_view PARA view_company_users_view
-- =====================================================

-- Primeiro, recriar a view com o novo nome
CREATE OR REPLACE VIEW public.view_company_users_view AS
SELECT 
  p.id,
  p.display_name,
  p.email,
  p.avatar,
  p.super_admin,
  p.created_at,
  p.aniversario,
  p.cidade,
  ue.empresa_id,
  ue.is_admin,
  ue.cargo_id,
  jr.title as cargo_title,
  ue.tipo_contrato,
  ue.data_inicio,
  ue.manual_cultura_aceito,
  ue.nivel_colaborador
FROM public.profiles p
INNER JOIN public.user_empresa ue ON p.id = ue.user_id
LEFT JOIN public.job_roles jr ON ue.cargo_id = jr.id;

-- Comentário explicativo
COMMENT ON VIEW public.view_company_users_view IS 
'View otimizada que combina profiles, user_empresa e job_roles em uma única query. Usa INNER JOIN para garantir que só retorna usuários que pertencem a empresas.';

-- Remover a view antiga
DROP VIEW IF EXISTS public.company_users_view;

-- =====================================================
-- 2. RENOMEAR team_members_view PARA view_team_members_view
-- =====================================================

-- Primeiro, recriar a view com o novo nome
CREATE OR REPLACE VIEW public.view_team_members_view AS
SELECT 
  p.id,
  p.display_name,
  p.email,
  p.avatar,
  p.super_admin,
  p.created_at,
  ue.empresa_id,
  ue.is_admin
FROM public.profiles p
INNER JOIN public.user_empresa ue ON p.id = ue.user_id;

-- Comentário explicativo
COMMENT ON VIEW public.view_team_members_view IS 
'View otimizada para membros da equipe. Combina profiles e user_empresa de forma simples e rápida.';

-- Remover a view antiga
DROP VIEW IF EXISTS public.team_members_view;

-- =====================================================
-- 3. ATUALIZAR FUNÇÃO get_company_users
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_company_users(_empresa_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  avatar text,
  super_admin boolean,
  created_at timestamptz,
  aniversario date,
  cidade text,
  is_admin boolean,
  cargo_id uuid,
  cargo_title text,
  tipo_contrato text,
  data_inicio date,
  manual_cultura_aceito boolean,
  nivel_colaborador text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    display_name,
    email,
    avatar,
    super_admin,
    created_at,
    aniversario,
    cidade,
    is_admin,
    cargo_id,
    cargo_title,
    tipo_contrato,
    data_inicio,
    manual_cultura_aceito,
    nivel_colaborador
  FROM public.view_company_users_view
  WHERE empresa_id = _empresa_id
  ORDER BY display_name ASC;
$$;

COMMENT ON FUNCTION public.get_company_users IS 
'Função helper que retorna usuários de uma empresa usando a view otimizada. Muito mais rápida que múltiplas queries.';

-- =====================================================
-- 4. ATUALIZAR FUNÇÃO get_team_members
-- =====================================================

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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    display_name,
    email,
    avatar,
    super_admin,
    created_at,
    is_admin
  FROM public.view_team_members_view
  WHERE empresa_id = _empresa_id
  ORDER BY display_name ASC;
$$;

COMMENT ON FUNCTION public.get_team_members IS 
'Função helper que retorna membros da equipe usando a view otimizada. Muito mais rápida que múltiplas queries.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================








