-- Permitir que usuários removam suas próprias associações com empresas
-- Esta policy permite que um usuário delete sua própria vinculação com uma empresa
CREATE POLICY "Users can remove themselves from companies"
ON public.user_empresa
FOR DELETE
USING (auth.uid() = user_id);