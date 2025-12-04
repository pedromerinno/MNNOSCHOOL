-- =====================================================
-- FASE 4: CRIAÇÃO DE VIEWS OTIMIZADAS
-- =====================================================
-- 
-- Esta migração:
-- 1. Otimiza views existentes
-- 2. Cria views materializadas para queries frequentes
-- 3. Cria views para relatórios comuns
--
-- RISCO: BAIXO - Apenas cria/atualiza views
-- IMPACTO: ALTO - Melhora performance de queries complexas
-- =====================================================

-- =====================================================
-- PARTE 1: OTIMIZAR VIEWS EXISTENTES
-- =====================================================

-- Otimizar view_company_users_view (já existe, vamos recriar otimizada)
DROP VIEW IF EXISTS public.view_company_users_view CASCADE;

CREATE VIEW public.view_company_users_view AS
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
  jr.title AS cargo_title,
  ue.tipo_contrato,
  ue.data_inicio,
  ue.manual_cultura_aceito,
  ue.nivel_colaborador,
  ue.updated_at AS membership_updated_at
FROM profiles p
JOIN user_empresa ue ON p.id = ue.user_id
LEFT JOIN job_roles jr ON ue.cargo_id = jr.id;

COMMENT ON VIEW public.view_company_users_view IS 'View otimizada para listar usuários com informações de empresa e cargo. Usa JOINs eficientes com índices.';

-- Otimizar view_team_members_view (já existe, vamos recriar otimizada)
DROP VIEW IF EXISTS public.view_team_members_view CASCADE;

CREATE VIEW public.view_team_members_view AS
SELECT 
  p.id,
  p.display_name,
  p.email,
  p.avatar,
  p.super_admin,
  p.created_at,
  ue.empresa_id,
  ue.is_admin,
  ue.cargo_id,
  jr.title AS cargo_title
FROM profiles p
JOIN user_empresa ue ON p.id = ue.user_id
LEFT JOIN job_roles jr ON ue.cargo_id = jr.id;

COMMENT ON VIEW public.view_team_members_view IS 'View otimizada para listar membros do time com informações básicas.';

-- Otimizar company_members_view (já existe, vamos recriar otimizada)
DROP VIEW IF EXISTS public.company_members_view CASCADE;

CREATE VIEW public.company_members_view AS
SELECT 
  ue.user_id,
  ue.empresa_id,
  ue.is_admin,
  ue.cargo_id,
  p.display_name,
  p.email,
  p.avatar,
  p.super_admin
FROM user_empresa ue
JOIN profiles p ON p.id = ue.user_id;

COMMENT ON VIEW public.company_members_view IS 'View otimizada para listar membros de empresa com informações básicas do perfil.';

-- =====================================================
-- PARTE 2: CRIAR VIEWS MATERIALIZADAS PARA QUERIES FREQUENTES
-- =====================================================

-- View materializada para estatísticas de progresso de cursos por empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_company_course_progress AS
SELECT 
  cc.empresa_id,
  cc.course_id,
  c.title AS course_title,
  COUNT(DISTINCT ucp.user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN ucp.completed = true THEN ucp.user_id END) AS completed_users,
  AVG(ucp.progress) AS avg_progress,
  MAX(ucp.last_accessed) AS last_accessed
FROM company_courses cc
JOIN courses c ON cc.course_id = c.id
LEFT JOIN user_course_progress ucp ON cc.course_id = ucp.course_id
GROUP BY cc.empresa_id, cc.course_id, c.title;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_company_course_progress_unique 
  ON public.mv_company_course_progress(empresa_id, course_id);

CREATE INDEX IF NOT EXISTS idx_mv_company_course_progress_empresa 
  ON public.mv_company_course_progress(empresa_id);

COMMENT ON MATERIALIZED VIEW public.mv_company_course_progress IS 'Estatísticas agregadas de progresso de cursos por empresa. Atualizar periodicamente com REFRESH MATERIALIZED VIEW.';

-- View materializada para estatísticas de usuários por empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_company_user_stats AS
SELECT 
  ue.empresa_id,
  COUNT(DISTINCT ue.user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN ue.is_admin = true THEN ue.user_id END) AS admin_users,
  COUNT(DISTINCT CASE WHEN ue.cargo_id IS NOT NULL THEN ue.user_id END) AS users_with_role,
  COUNT(DISTINCT CASE WHEN ue.tipo_contrato = 'CLT' THEN ue.user_id END) AS clt_users,
  COUNT(DISTINCT CASE WHEN ue.tipo_contrato = 'PJ' THEN ue.user_id END) AS pj_users,
  COUNT(DISTINCT CASE WHEN ue.tipo_contrato = 'Fornecedor' THEN ue.user_id END) AS fornecedor_users,
  COUNT(DISTINCT CASE WHEN ue.nivel_colaborador = 'Junior' THEN ue.user_id END) AS junior_users,
  COUNT(DISTINCT CASE WHEN ue.nivel_colaborador = 'Pleno' THEN ue.user_id END) AS pleno_users,
  COUNT(DISTINCT CASE WHEN ue.nivel_colaborador = 'Senior' THEN ue.user_id END) AS senior_users
FROM user_empresa ue
GROUP BY ue.empresa_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_company_user_stats_unique 
  ON public.mv_company_user_stats(empresa_id);

COMMENT ON MATERIALIZED VIEW public.mv_company_user_stats IS 'Estatísticas agregadas de usuários por empresa. Atualizar periodicamente com REFRESH MATERIALIZED VIEW.';

-- View materializada para estatísticas de lições completadas
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_lesson_completion_stats AS
SELECT 
  l.course_id,
  l.id AS lesson_id,
  l.title AS lesson_title,
  COUNT(DISTINCT ulp.user_id) AS total_started,
  COUNT(DISTINCT CASE WHEN ulp.completed = true THEN ulp.user_id END) AS total_completed,
  ROUND(
    COUNT(DISTINCT CASE WHEN ulp.completed = true THEN ulp.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT ulp.user_id), 0) * 100, 
    2
  ) AS completion_rate
FROM lessons l
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id
GROUP BY l.course_id, l.id, l.title, l.order_index
ORDER BY l.course_id, l.order_index;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_lesson_completion_stats_unique 
  ON public.mv_lesson_completion_stats(lesson_id);

CREATE INDEX IF NOT EXISTS idx_mv_lesson_completion_stats_course 
  ON public.mv_lesson_completion_stats(course_id);

COMMENT ON MATERIALIZED VIEW public.mv_lesson_completion_stats IS 'Estatísticas de conclusão de lições por curso. Atualizar periodicamente com REFRESH MATERIALIZED VIEW.';

-- =====================================================
-- PARTE 3: CRIAR VIEWS PARA RELATÓRIOS COMUNS
-- =====================================================

-- View para relatório de atividades recentes de usuários
CREATE OR REPLACE VIEW public.v_user_recent_activity AS
SELECT 
  ue.user_id,
  ue.empresa_id,
  p.display_name,
  p.email,
  'course_progress' AS activity_type,
  c.title AS activity_title,
  ucp.last_accessed AS activity_date,
  ucp.progress AS activity_data
FROM user_course_progress ucp
JOIN courses c ON ucp.course_id = c.id
JOIN user_empresa ue ON ucp.user_id = ue.user_id
JOIN profiles p ON ue.user_id = p.id
WHERE ucp.last_accessed >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  ue.user_id,
  ue.empresa_id,
  p.display_name,
  p.email,
  'lesson_progress' AS activity_type,
  l.title AS activity_title,
  ulp.last_accessed AS activity_date,
  CASE WHEN ulp.completed THEN 100 ELSE 0 END AS activity_data
FROM user_lesson_progress ulp
JOIN lessons l ON ulp.lesson_id = l.id
JOIN user_empresa ue ON ulp.user_id = ue.user_id
JOIN profiles p ON ue.user_id = p.id
WHERE ulp.last_accessed >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  ue.user_id,
  ue.empresa_id,
  p.display_name,
  p.email,
  'discussion' AS activity_type,
  d.title AS activity_title,
  d.created_at AS activity_date,
  NULL AS activity_data
FROM discussions d
JOIN user_empresa ue ON d.author_id = ue.user_id
JOIN profiles p ON ue.user_id = p.id
WHERE d.created_at >= NOW() - INTERVAL '30 days'

ORDER BY activity_date DESC;

COMMENT ON VIEW public.v_user_recent_activity IS 'View para relatório de atividades recentes dos usuários (últimos 30 dias).';

-- View para relatório de cursos mais acessados
CREATE OR REPLACE VIEW public.v_popular_courses AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.image_url,
  c.instructor,
  COUNT(DISTINCT cc.empresa_id) AS total_companies,
  COUNT(DISTINCT ucp.user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN ucp.completed = true THEN ucp.user_id END) AS completed_users,
  AVG(ucp.progress) AS avg_progress,
  MAX(ucp.last_accessed) AS last_accessed
FROM courses c
LEFT JOIN company_courses cc ON c.id = cc.course_id
LEFT JOIN user_course_progress ucp ON c.id = ucp.course_id
GROUP BY c.id, c.title, c.description, c.image_url, c.instructor
ORDER BY total_users DESC, avg_progress DESC;

COMMENT ON VIEW public.v_popular_courses IS 'View para relatório de cursos mais populares e acessados.';

-- View para relatório de progresso de usuários por empresa
CREATE OR REPLACE VIEW public.v_company_user_progress AS
SELECT 
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  ue.user_id,
  p.display_name,
  p.email,
  COUNT(DISTINCT ucp.course_id) AS total_courses,
  COUNT(DISTINCT CASE WHEN ucp.completed = true THEN ucp.course_id END) AS completed_courses,
  AVG(ucp.progress) AS avg_progress,
  SUM(CASE WHEN ulp.completed = true THEN 1 ELSE 0 END) AS completed_lessons,
  MAX(GREATEST(ucp.last_accessed, ulp.last_accessed)) AS last_activity
FROM empresas e
JOIN user_empresa ue ON e.id = ue.empresa_id
JOIN profiles p ON ue.user_id = p.id
LEFT JOIN user_course_progress ucp ON ue.user_id = ucp.user_id
LEFT JOIN user_lesson_progress ulp ON ue.user_id = ulp.user_id
GROUP BY e.id, e.nome, ue.user_id, p.display_name, p.email
ORDER BY e.nome, avg_progress DESC;

COMMENT ON VIEW public.v_company_user_progress IS 'View para relatório de progresso de usuários agrupado por empresa.';

-- View para dashboard de admin - visão geral
CREATE OR REPLACE VIEW public.v_admin_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM empresas) AS total_companies,
  (SELECT COUNT(*) FROM profiles) AS total_users,
  (SELECT COUNT(*) FROM courses) AS total_courses,
  (SELECT COUNT(*) FROM lessons) AS total_lessons,
  (SELECT COUNT(*) FROM user_course_progress WHERE completed = true) AS completed_courses,
  (SELECT COUNT(*) FROM user_lesson_progress WHERE completed = true) AS completed_lessons,
  (SELECT COUNT(*) FROM discussions WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_discussions,
  (SELECT COUNT(*) FROM user_notifications WHERE read = false) AS unread_notifications;

COMMENT ON VIEW public.v_admin_dashboard IS 'View para dashboard de admin com estatísticas gerais do sistema.';

-- =====================================================
-- PARTE 4: CRIAR FUNÇÃO PARA ATUALIZAR VIEWS MATERIALIZADAS
-- =====================================================

-- Função para atualizar todas as views materializadas
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_company_course_progress;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_company_user_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_lesson_completion_stats;
  
  RAISE NOTICE 'Todas as views materializadas foram atualizadas com sucesso.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao atualizar views materializadas: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.refresh_all_materialized_views IS 'Atualiza todas as views materializadas do sistema. Executar periodicamente (ex: diariamente via cron).';

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 4
-- =====================================================
-- 
-- NOTAS:
-- 1. Views materializadas precisam ser atualizadas periodicamente
-- 2. Use REFRESH MATERIALIZED VIEW CONCURRENTLY para atualização sem bloqueio
-- 3. Configure um job (cron) para atualizar views materializadas diariamente
-- 4. Views regulares são atualizadas automaticamente quando dados mudam
-- =====================================================



