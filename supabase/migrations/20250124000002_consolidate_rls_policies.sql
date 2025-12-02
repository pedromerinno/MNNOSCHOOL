-- =====================================================
-- CONSOLIDAÇÃO DE POLÍTICAS RLS DUPLICADAS - FASE 3
-- Remove políticas duplicadas e consolida em uma única
-- =====================================================
-- 
-- Esta migração consolida políticas RLS duplicadas que
-- fazem a mesma coisa, melhorando performance ao reduzir
-- o número de políticas que precisam ser avaliadas.
--
-- RISCO: BAIXO - Apenas remove duplicatas, mantém lógica
-- IMPACTO: MÉDIO - Reduz overhead de avaliação de políticas
-- =====================================================

-- =====================================================
-- PROFILES - Consolidar políticas SELECT duplicadas
-- =====================================================

-- Remover políticas duplicadas de usuários vendo próprio perfil
-- Manter apenas "Users can view their own profile"
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
-- Manter: "Users can view their own profile"

-- Remover política duplicada de admin (manter a otimizada)
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
-- Manter: "Admins can view all profiles" (já otimizada)

-- A política "Admins see users from their companies" é mais complexa e deve ser mantida
-- mas pode ser otimizada depois

-- =====================================================
-- PROFILES - Consolidar políticas UPDATE duplicadas
-- =====================================================

-- Remover políticas UPDATE duplicadas de usuários
-- Manter apenas "Users can update their own profile" (já otimizada)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
-- Manter: "Users can update their own profile" e "Usuários podem atualizar seus próprios interesses"

-- =====================================================
-- USER_EMPRESA - Consolidar políticas SELECT duplicadas
-- =====================================================

-- Remover políticas duplicadas de usuários vendo próprias associações
-- Manter apenas "Users can view their own memberships" (já otimizada)
DROP POLICY IF EXISTS "Users can view own company associations" ON public.user_empresa;
DROP POLICY IF EXISTS "Users can view their own company relationships" ON public.user_empresa;
-- Manter: "Users can view their own memberships"

-- =====================================================
-- DISCUSSIONS - Consolidar políticas duplicadas
-- =====================================================

-- Remover políticas duplicadas de DELETE
DROP POLICY IF EXISTS "Users can delete own discussions" ON public.discussions;
-- Manter: "Allow users to delete own discussions" (já otimizada)

-- Remover políticas duplicadas de INSERT
DROP POLICY IF EXISTS "Users can create company discussions" ON public.discussions;
-- Manter: "Allow users to create discussions" (já otimizada)

-- =====================================================
-- DISCUSSION_REPLIES - Consolidar políticas duplicadas
-- =====================================================

-- Remover políticas duplicadas de DELETE
DROP POLICY IF EXISTS "Users can delete own replies" ON public.discussion_replies;
-- Manter: "Allow users to delete own replies" (já otimizada)

-- Remover políticas duplicadas de INSERT
DROP POLICY IF EXISTS "Users can create company discussion replies" ON public.discussion_replies;
-- Manter: "Allow users to create replies" (já otimizada)

-- =====================================================
-- USER_DOCUMENTS - Consolidar políticas duplicadas
-- =====================================================

-- Remover políticas duplicadas de DELETE
DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON public.user_documents;
-- Manter: "Users can delete their own documents" (já otimizada)

-- Remover políticas duplicadas de INSERT
DROP POLICY IF EXISTS "Users can insert documents" ON public.user_documents;
-- Manter: "Users can insert their own documents" (já otimizada)

-- =====================================================
-- EMPRESAS - Consolidar políticas SELECT duplicadas
-- =====================================================

-- Remover políticas duplicadas similares
-- Manter as mais específicas e otimizadas
DROP POLICY IF EXISTS "Users see only their companies" ON public.empresas;
DROP POLICY IF EXISTS "Users can view companies they admin" ON public.empresas;
DROP POLICY IF EXISTS "Regular users can see their companies" ON public.empresas;
-- Manter: "Users can view companies they belong to" e outras mais específicas

-- =====================================================
-- COURSES - Consolidar políticas SELECT duplicadas
-- =====================================================

-- Remover políticas duplicadas similares
DROP POLICY IF EXISTS "Users see only their company courses" ON public.courses;
-- Manter: "Users can view courses from their companies or if they are admi" e outras

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

