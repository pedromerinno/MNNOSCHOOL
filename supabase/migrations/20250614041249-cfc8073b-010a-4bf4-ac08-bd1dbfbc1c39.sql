
-- Adicionar políticas RLS para a tabela company_access
-- Política para que usuários vejam acessos da empresa onde estão vinculados
CREATE POLICY "Users can view company access where they belong" 
  ON public.company_access 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_empresa 
      WHERE user_id = auth.uid() 
      AND empresa_id = company_access.company_id
    )
  );

-- Política para que admins possam criar acessos da empresa
CREATE POLICY "Admins can create company access" 
  ON public.company_access 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_empresa 
      WHERE user_id = auth.uid() 
      AND empresa_id = company_access.company_id 
      AND is_admin = true
    ) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR super_admin = true)
    )
  );

-- Política para que admins possam atualizar acessos da empresa
CREATE POLICY "Admins can update company access" 
  ON public.company_access 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_empresa 
      WHERE user_id = auth.uid() 
      AND empresa_id = company_access.company_id 
      AND is_admin = true
    ) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR super_admin = true)
    )
  );

-- Política para que admins possam deletar acessos da empresa
CREATE POLICY "Admins can delete company access" 
  ON public.company_access 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_empresa 
      WHERE user_id = auth.uid() 
      AND empresa_id = company_access.company_id 
      AND is_admin = true
    ) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR super_admin = true)
    )
  );

-- Habilitar RLS na tabela company_access se ainda não estiver habilitado
ALTER TABLE public.company_access ENABLE ROW LEVEL SECURITY;
