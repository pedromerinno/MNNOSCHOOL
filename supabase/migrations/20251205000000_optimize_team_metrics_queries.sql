-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE: Métricas da Equipe
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- O carregamento de métricas da página Equipe está lento devido a:
-- 1. Query ineficiente usando .in('user_id', memberIds) que passa array de IDs do cliente
-- 2. Falta de índices compostos otimizados para queries de contagem
-- 3. JOINs não otimizados entre user_lesson_progress e user_empresa
--
-- SOLUÇÃO:
-- 1. Criar função RPC que faz JOIN direto no banco usando company_id
-- 2. Adicionar índices compostos para otimizar queries de contagem
-- 3. Evitar passar arrays grandes de IDs do cliente para o banco
--
-- IMPACTO ESPERADO:
-- Redução de 60-80% no tempo de carregamento das métricas
-- =====================================================

-- =====================================================
-- 1. ADICIONAR ÍNDICES COMPOSTOS OTIMIZADOS
-- =====================================================

-- Índice composto para queries de contagem de lessons completadas por usuário
-- Otimiza: SELECT COUNT(*) FROM user_lesson_progress WHERE user_id IN (...) AND completed = true
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_completed 
ON public.user_lesson_progress(user_id, completed) 
WHERE completed = true;

-- Índice para otimizar JOIN entre user_lesson_progress e user_empresa
-- Usado na função RPC get_company_lessons_count
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id 
ON public.user_lesson_progress(user_id);

-- Índice composto para otimizar queries de discussions por empresa
-- Já existe em migration anterior, mas garantimos que existe
CREATE INDEX IF NOT EXISTS idx_discussions_company_id 
ON public.discussions(company_id);

-- =====================================================
-- 2. CRIAR FUNÇÃO RPC OTIMIZADA PARA CONTAGEM DE LESSONS
-- =====================================================
-- Esta função evita passar array de user_ids do cliente
-- Faz JOIN direto no banco usando company_id, muito mais eficiente

CREATE OR REPLACE FUNCTION public.get_company_lessons_count(_empresa_id uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  has_permission boolean := false;
  lessons_count bigint := 0;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Verificação otimizada de permissão (mesma lógica de get_company_users)
  -- Verifica primeiro super_admin (mais rápido com índice)
  SELECT COALESCE(super_admin, false) INTO has_permission
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  -- Se for super admin, já tem permissão
  IF has_permission THEN
    -- Continuar para retornar os dados
  ELSE
    -- Verificar se é admin da empresa específica
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id
      AND empresa_id = _empresa_id
      AND is_admin = true
      LIMIT 1
    ) INTO has_permission;
    
    -- Se não for admin, verificar se é membro
    IF NOT has_permission THEN
      -- Verificar se é membro da empresa (pode ver métricas da empresa)
      SELECT EXISTS (
        SELECT 1 FROM public.user_empresa
        WHERE user_id = current_user_id
        AND empresa_id = _empresa_id
        LIMIT 1
      ) INTO has_permission;
    END IF;
  END IF;
  
  -- Se não tem permissão, retornar 0
  IF NOT has_permission THEN
    RETURN 0;
  END IF;
  
  -- Contar lessons completadas usando JOIN direto com user_empresa
  -- Muito mais eficiente que passar array de user_ids do cliente
  -- Usa os índices criados acima para performance máxima
  SELECT COUNT(*) INTO lessons_count
  FROM public.user_lesson_progress ulp
  INNER JOIN public.user_empresa ue ON ulp.user_id = ue.user_id
  WHERE ue.empresa_id = _empresa_id
  AND ulp.completed = true;
  
  RETURN COALESCE(lessons_count, 0);
END;
$$;

COMMENT ON FUNCTION public.get_company_lessons_count(uuid) IS 
'Retorna o número de lessons completadas por todos os usuários de uma empresa. Otimizada com JOIN direto no banco, evitando passar arrays de IDs do cliente. Usa índices compostos para performance máxima.';

-- =====================================================
-- 3. CRIAR FUNÇÃO RPC OTIMIZADA PARA CONTAGEM DE DISCUSSIONS
-- =====================================================
-- Esta função já é simples, mas garantimos que está otimizada
-- e tem verificação de permissão consistente

CREATE OR REPLACE FUNCTION public.get_company_discussions_count(_empresa_id uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  has_permission boolean := false;
  discussions_count bigint := 0;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR _empresa_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Verificação otimizada de permissão (mesma lógica de get_company_users)
  SELECT COALESCE(super_admin, false) INTO has_permission
  FROM public.profiles
  WHERE id = current_user_id
  LIMIT 1;
  
  IF has_permission THEN
    -- Continuar
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_id = current_user_id
      AND empresa_id = _empresa_id
      AND is_admin = true
      LIMIT 1
    ) INTO has_permission;
    
    IF NOT has_permission THEN
      SELECT EXISTS (
        SELECT 1 FROM public.user_empresa
        WHERE user_id = current_user_id
        AND empresa_id = _empresa_id
        LIMIT 1
      ) INTO has_permission;
    END IF;
  END IF;
  
  IF NOT has_permission THEN
    RETURN 0;
  END IF;
  
  -- Contar discussions da empresa usando índice otimizado
  SELECT COUNT(*) INTO discussions_count
  FROM public.discussions
  WHERE company_id = _empresa_id;
  
  RETURN COALESCE(discussions_count, 0);
END;
$$;

COMMENT ON FUNCTION public.get_company_discussions_count(uuid) IS 
'Retorna o número de discussions de uma empresa. Otimizada com índice e verificação de permissão consistente.';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================




