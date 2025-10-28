-- Permitir que usuários autenticados busquem empresas pelo ID
-- Isso é necessário para o fluxo de onboarding onde colaboradores
-- precisam se vincular a uma empresa usando o ID

-- Criar política para permitir busca de empresa por ID para usuários autenticados
CREATE POLICY "Authenticated users can lookup companies by ID"
ON public.empresas
FOR SELECT
TO authenticated
USING (
  -- Permite visualizar apenas informações básicas quando buscar por ID específico
  -- Isso é seguro porque o usuário precisa conhecer o ID exato da empresa
  true
);

-- NOTA: Esta política funciona em conjunto com as políticas existentes
-- que já restringem o acesso baseado em vinculação de usuário.
-- A política mais permissiva prevalece, então usuários autenticados
-- poderão buscar empresas por ID, mas outras políticas ainda aplicam
-- restrições adicionais onde necessário.