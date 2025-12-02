-- =====================================================
-- MIGRAÇÃO: Preparar remoção de colunas antigas
-- =====================================================
-- 
-- Esta migração NÃO remove as colunas ainda.
-- Ela apenas documenta e prepara a estrutura.
--
-- ⚠️ IMPORTANTE: NÃO execute a remoção das colunas até:
-- 1. Atualizar TODO o código da aplicação
-- 2. Testar todas as funcionalidades
-- 3. Validar que nenhum código ainda usa as colunas antigas
--
-- RISCO: ALTO se executar antes do tempo
-- IMPACTO: Alto - limpeza final da estrutura
-- =====================================================

-- Esta migração está vazia intencionalmente.
-- Ela serve como placeholder para quando formos remover as colunas antigas.

-- Para remover as colunas antigas, descomente e execute:
/*
-- Passo 1: Remover índice de cargo_id em profiles
DROP INDEX IF EXISTS idx_profiles_cargo_id;

-- Passo 2: Remover foreign key constraint de cargo_id
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_cargo_id_fkey;

-- Passo 3: Remover coluna cargo_id de profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS cargo_id;

-- Passo 4: Remover coluna is_admin de profiles
-- ⚠️ CUIDADO: Verificar se não há código que ainda usa isso
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS is_admin;

-- Passo 5: Atualizar comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuários. Apenas contém dados pessoais e super_admin (global). Roles por empresa estão em user_empresa.';
*/

-- Por enquanto, vamos apenas adicionar um comentário documentando
-- que essas colunas estão deprecadas
COMMENT ON COLUMN public.profiles.cargo_id IS 'DEPRECATED: Use user_empresa.cargo_id. Esta coluna será removida após migração completa.';
COMMENT ON COLUMN public.profiles.is_admin IS 'DEPRECATED: Use user_empresa.is_admin. Esta coluna será removida após migração completa.';

