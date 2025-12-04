-- =====================================================
-- GARANTIR ÍNDICES PARA VERIFICAÇÃO DE USUÁRIOS
-- =====================================================
-- 
-- Esta migração garante que todos os índices necessários
-- para otimizar a verificação de usuários na empresa existam.
-- Alguns podem já existir, mas garantimos com IF NOT EXISTS.
--
-- RISCO: ZERO - Apenas cria índices se não existirem
-- IMPACTO: ALTO - Melhora performance de queries de verificação
-- =====================================================

-- =====================================================
-- 1. GARANTIR ÍNDICE EM job_roles.id (se não for PK)
-- =====================================================
-- O job_roles.id geralmente é PK, mas garantimos índice
-- para o JOIN na função get_company_users
-- Este índice já deve existir se id for PK, mas garantimos

-- Verificar se job_roles.id é primary key (já indexado automaticamente)
-- Se não for, criar índice. Mas geralmente é PK, então este é apenas uma garantia
-- Não criamos índice duplicado se já for PK

-- =====================================================
-- 2. GARANTIR ÍNDICE COMPOSTO PARA QUERY DE VERIFICAÇÃO
-- =====================================================
-- Índice para otimizar verificação de usuário em empresa
-- Query: WHERE user_id = X AND empresa_id = Y
-- Este índice já deve existir, mas garantimos

CREATE INDEX IF NOT EXISTS idx_user_empresa_user_empresa_verification
ON public.user_empresa(user_id, empresa_id);

-- =====================================================
-- 3. GARANTIR ÍNDICE PARA ORDER BY display_name
-- =====================================================
-- Já existe idx_profiles_display_name, mas garantimos
CREATE INDEX IF NOT EXISTS idx_profiles_display_name
ON public.profiles(display_name);

-- =====================================================
-- 4. GARANTIR ÍNDICE PARA JOIN profiles.id = user_empresa.user_id
-- =====================================================
-- profiles.id é PK (já indexado), mas garantimos índice em user_empresa.user_id
-- para otimizar o JOIN na direção inversa
CREATE INDEX IF NOT EXISTS idx_user_empresa_user_id_join
ON public.user_empresa(user_id);

-- =====================================================
-- 5. GARANTIR ÍNDICE PARA JOIN job_roles (se necessário)
-- =====================================================
-- job_roles.id geralmente é PK, mas se não for, criamos índice
-- Para o JOIN: LEFT JOIN job_roles jr ON ue.cargo_id = jr.id
-- O cargo_id já tem índice (idx_user_empresa_cargo_id), mas garantimos
-- que job_roles.id também está indexado

-- Não criamos índice duplicado se job_roles.id já for PK
-- Mas garantimos que o índice em cargo_id existe para o JOIN
CREATE INDEX IF NOT EXISTS idx_user_empresa_cargo_id
ON public.user_empresa(cargo_id);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- 
-- NOTA: Esta migração é idempotente - todos os índices
-- usam IF NOT EXISTS, então podem ser executados múltiplas vezes
-- sem causar erros.




