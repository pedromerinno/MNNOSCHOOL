
-- Verificar se RLS está habilitado na tabela company_access
ALTER TABLE public.company_access ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam acessos da empresa onde estão vinculados
DROP POLICY IF EXISTS "Users can view company access where they belong" ON public.company_access;
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
DROP POLICY IF EXISTS "Admins can create company access" ON public.company_access;
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
DROP POLICY IF EXISTS "Admins can update company access" ON public.company_access;
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
DROP POLICY IF EXISTS "Admins can delete company access" ON public.company_access;
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
