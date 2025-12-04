-- =====================================================
-- MIGRAÇÃO: Otimizar validação de admin
-- =====================================================
-- 
-- Esta migração:
-- 1. Adiciona índice composto otimizado para verificação de admin
-- 2. Otimiza função RPC is_admin_for_company para query única e mais rápida
-- 3. Melhora performance da validação de admin
--
-- RISCO: BAIXO - Apenas otimizações
-- IMPACTO: ALTO - Melhora significativa na velocidade de validação
-- =====================================================

-- Passo 1: Adicionar índice composto otimizado para verificação de admin
-- Este índice acelera queries que verificam se um usuário é admin de uma empresa
CREATE INDEX IF NOT EXISTS idx_user_empresa_user_empresa_is_admin 
ON public.user_empresa(user_id, empresa_id, is_admin) 
WHERE is_admin = true;

-- Índice adicional para verificar super_admin rapidamente
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin 
ON public.profiles(id, super_admin) 
WHERE super_admin = true;

-- Passo 2: Otimizar função is_user_admin_for_company
-- Usar uma única query com LEFT JOIN para melhor performance
CREATE OR REPLACE FUNCTION public.is_user_admin_for_company(
  user_id_param UUID,
  company_id_param UUID
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Verificar super_admin primeiro (mais rápido com índice)
  SELECT COALESCE(
    (SELECT true FROM public.profiles WHERE id = user_id_param AND super_admin = true LIMIT 1),
    -- Se não for super_admin, verificar is_admin na empresa (usando índice)
    (SELECT true FROM public.user_empresa 
     WHERE user_id = user_id_param 
       AND empresa_id = company_id_param 
       AND is_admin = true 
     LIMIT 1),
    false
  );
$$;

COMMENT ON FUNCTION public.is_user_admin_for_company IS 'Verifica se um usuário é admin de uma empresa específica. Super admins sempre retornam true. Otimizado para performance.';

-- Passo 3: Otimizar função is_admin_for_company (wrapper)
-- Já está otimizada, mas vamos garantir que está usando a versão otimizada
CREATE OR REPLACE FUNCTION public.is_admin_for_company(
  company_id_param UUID
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_user_admin_for_company(auth.uid(), company_id_param);
$$;

COMMENT ON FUNCTION public.is_admin_for_company IS 'Verifica se o usuário atual é admin de uma empresa específica. Otimizado para performance.';



