-- =====================================================
-- MIGRAÇÃO: Remover coluna is_admin da tabela profiles
-- =====================================================
-- 
-- Esta migração remove a coluna is_admin que está deprecada.
-- A funcionalidade de admin por empresa já está em user_empresa.is_admin.
-- Apenas super_admin permanece em profiles (global).
--
-- RISCO: BAIXO - Coluna já está documentada como deprecada
-- IMPACTO: MÉDIO - Limpeza da estrutura
-- =====================================================

-- Passo 1: Verificar se a coluna existe antes de remover
DO $$
BEGIN
  -- Remover coluna is_admin se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN is_admin;
    RAISE NOTICE 'Coluna is_admin removida com sucesso';
  ELSE
    RAISE NOTICE 'Coluna is_admin não existe, pulando remoção';
  END IF;

  -- Verificar e remover coluna admin (sem is_) se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'admin'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN admin;
    RAISE NOTICE 'Coluna admin removida com sucesso';
  ELSE
    RAISE NOTICE 'Coluna admin não existe, pulando remoção';
  END IF;
END $$;

-- Passo 2: Atualizar comentário da tabela
COMMENT ON TABLE public.profiles IS 'Perfis de usuários. Contém dados pessoais e super_admin (global). Roles por empresa estão em user_empresa.';

-- Passo 3: Verificar se há funções ou políticas que ainda referenciam is_admin
-- (As funções já foram atualizadas para usar user_empresa.is_admin)

