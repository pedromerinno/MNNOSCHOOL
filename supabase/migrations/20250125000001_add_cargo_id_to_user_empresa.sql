-- =====================================================
-- MIGRAÇÃO: Adicionar cargo_id à tabela user_empresa
-- Permite que usuários tenham cargos diferentes por empresa
-- =====================================================
-- 
-- Esta migração:
-- 1. Adiciona coluna cargo_id em user_empresa
-- 2. Migra dados existentes de profiles.cargo_id
-- 3. Adiciona índices e constraints necessárias
--
-- RISCO: BAIXO - Não remove dados, apenas adiciona estrutura
-- IMPACTO: ALTO - Permite sistema de roles por empresa
-- =====================================================

-- Passo 1: Adicionar coluna cargo_id em user_empresa
ALTER TABLE public.user_empresa
ADD COLUMN IF NOT EXISTS cargo_id UUID;

-- Passo 2: Adicionar comentário para documentação
COMMENT ON COLUMN public.user_empresa.cargo_id IS 'Cargo do usuário nesta empresa específica. Permite que o mesmo usuário tenha cargos diferentes em empresas diferentes.';

-- Passo 3: Migrar dados existentes
-- Para cada usuário que tem um cargo_id em profiles,
-- atualizar todas as suas associações em user_empresa com esse cargo
DO $$
DECLARE
  user_record RECORD;
  cargo_record RECORD;
  user_companies RECORD;
BEGIN
  -- Para cada usuário que tem cargo_id em profiles
  FOR user_record IN 
    SELECT DISTINCT id, cargo_id 
    FROM public.profiles 
    WHERE cargo_id IS NOT NULL
  LOOP
    -- Buscar o cargo para validar que pertence a uma empresa válida
    -- Atualizar TODAS as associações desse usuário com empresas
    -- que têm esse cargo disponível
    FOR user_companies IN
      SELECT ue.id as user_empresa_id, ue.empresa_id
      FROM public.user_empresa ue
      WHERE ue.user_id = user_record.id
    LOOP
      -- Verificar se o cargo pertence à empresa dessa associação
      SELECT id INTO cargo_record
      FROM public.job_roles
      WHERE id = user_record.cargo_id
        AND company_id = user_companies.empresa_id
      LIMIT 1;
      
      -- Se o cargo pertence à empresa, atribuir
      IF FOUND THEN
        UPDATE public.user_empresa
        SET cargo_id = user_record.cargo_id
        WHERE id = user_companies.user_empresa_id;
        
        RAISE NOTICE 'Migrado cargo % para usuário % na empresa %', 
          user_record.cargo_id, user_record.id, user_companies.empresa_id;
      ELSE
        -- Se o cargo não pertence à empresa, deixar NULL
        -- (usuário pode ter cargo apenas em algumas empresas)
        RAISE NOTICE 'Cargo % não pertence à empresa % - deixando NULL', 
          user_record.cargo_id, user_companies.empresa_id;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migração de cargos concluída';
END $$;

-- Passo 4: Adicionar foreign key constraint
-- Permite NULL porque usuário pode não ter cargo em uma empresa
ALTER TABLE public.user_empresa
ADD CONSTRAINT fk_user_empresa_cargo_id
FOREIGN KEY (cargo_id) 
REFERENCES public.job_roles(id) 
ON DELETE SET NULL;

-- Passo 5: Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_empresa_cargo_id 
ON public.user_empresa(cargo_id);

-- Índice composto para queries comuns: buscar usuários de uma empresa por cargo
CREATE INDEX IF NOT EXISTS idx_user_empresa_empresa_cargo 
ON public.user_empresa(empresa_id, cargo_id);

-- Índice composto para queries: buscar usuário e empresa com cargo
CREATE INDEX IF NOT EXISTS idx_user_empresa_user_empresa_cargo 
ON public.user_empresa(user_id, empresa_id, cargo_id);

-- Passo 6: Adicionar constraint para garantir integridade
-- Um cargo só pode ser atribuído se pertencer à empresa da associação
-- Isso será verificado via trigger ou na aplicação
-- Não podemos usar CHECK constraint porque precisa fazer JOIN

COMMENT ON TABLE public.user_empresa IS 'Associação entre usuários e empresas. Cada registro representa um usuário em uma empresa específica, com role (is_admin) e cargo (cargo_id) próprios para aquela empresa.';

