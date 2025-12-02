-- =====================================================
-- CONSOLIDAÇÃO DE POLÍTICAS DUPLICADAS RESTANTES - FASE 7
-- Remove políticas duplicadas restantes
-- =====================================================

-- =====================================================
-- EMPRESAS - Consolidar políticas duplicadas
-- =====================================================

-- Remover políticas duplicadas de DELETE (manter "Admins can delete companies")
DROP POLICY IF EXISTS "Allow admins to delete empresas" ON public.empresas;

-- Remover políticas duplicadas de UPDATE (manter "Admins can update companies")
DROP POLICY IF EXISTS "Allow admins to update empresas" ON public.empresas;

-- Remover políticas duplicadas de INSERT (manter "Admins can insert companies")
DROP POLICY IF EXISTS "Allow admins to insert empresas" ON public.empresas;

-- A política "Users can update companies they admin" é diferente e deve ser mantida

-- =====================================================
-- COMPANY_COURSES - Consolidar políticas duplicadas
-- =====================================================

-- Remover "Admins can manage company_courses" pois "Control course-company associations" já cobre isso
-- Mas "Control course-company associations" é mais específica, então vamos manter ambas por enquanto
-- Na verdade, "Admins can manage company_courses" é mais simples e pode ser removida se "Control" cobre tudo
-- Vamos manter "Control course-company associations" pois é mais completa

DROP POLICY IF EXISTS "Admins can manage company_courses" ON public.company_courses;

-- =====================================================
-- JOB_ROLES - Consolidar políticas duplicadas
-- =====================================================

-- Remover políticas duplicadas (manter as mais específicas)
DROP POLICY IF EXISTS "Allow admins to manage job_roles" ON public.job_roles;
DROP POLICY IF EXISTS "Admins podem gerenciar cargos" ON public.job_roles;
-- Manter: "Admins can manage job roles" (já otimizada)

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

