
-- Remove as políticas RLS que dependem da coluna interesses
DROP POLICY IF EXISTS "Users in onboarding can create companies" ON public.empresas;
DROP POLICY IF EXISTS "Users in onboarding can create admin relationships" ON public.user_empresa;

-- Agora remove a coluna interesses da tabela profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS interesses;
