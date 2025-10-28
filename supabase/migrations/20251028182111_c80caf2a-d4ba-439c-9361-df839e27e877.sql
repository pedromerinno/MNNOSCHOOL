-- Permitir que usuários se vinculem a empresas existentes durante onboarding
-- Esta policy permite que um usuário crie sua própria associação com uma empresa
CREATE POLICY "Users can associate themselves to companies during onboarding"
ON public.user_empresa
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_admin = false);