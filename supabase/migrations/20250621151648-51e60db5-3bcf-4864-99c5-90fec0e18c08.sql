
-- Criar tabela para vincular documentos da empresa a usuários específicos
CREATE TABLE public.company_document_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_document_id, user_id)
);

-- Adicionar índices para performance
CREATE INDEX idx_company_document_users_document_id ON public.company_document_users(company_document_id);
CREATE INDEX idx_company_document_users_user_id ON public.company_document_users(user_id);

-- Habilitar RLS
ALTER TABLE public.company_document_users ENABLE ROW LEVEL SECURITY;

-- Adicionar foreign keys
ALTER TABLE public.company_document_users 
ADD CONSTRAINT fk_company_document_users_document_id 
FOREIGN KEY (company_document_id) REFERENCES public.company_documents(id) ON DELETE CASCADE;

ALTER TABLE public.company_document_users 
ADD CONSTRAINT fk_company_document_users_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Políticas RLS para company_document_users
CREATE POLICY "Users can view company document user links" 
  ON public.company_document_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM company_documents cd
      JOIN user_empresa ue ON cd.company_id = ue.empresa_id
      WHERE cd.id = company_document_id 
      AND ue.user_id = auth.uid()
    )
  );

-- Admins podem gerenciar vínculos de documentos da empresa com usuários
CREATE POLICY "Admins can manage company document user links" 
  ON public.company_document_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM company_documents cd
      JOIN profiles p ON p.id = auth.uid()
      JOIN user_empresa ue ON p.id = ue.user_id
      WHERE cd.id = company_document_id 
      AND ue.empresa_id = cd.company_id
      AND (p.is_admin = true OR p.super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_documents cd
      JOIN profiles p ON p.id = auth.uid()
      JOIN user_empresa ue ON p.id = ue.user_id
      WHERE cd.id = company_document_id 
      AND ue.empresa_id = cd.company_id
      AND (p.is_admin = true OR p.super_admin = true)
    )
  );

-- Atualizar função para verificar acesso a documentos da empresa incluindo usuários específicos
CREATE OR REPLACE FUNCTION public.user_can_access_company_document(document_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_has_company_access boolean := false;
  document_has_role_restrictions boolean := false;
  document_has_user_restrictions boolean := false;
  user_has_required_role boolean := false;
  user_has_specific_access boolean := false;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar se usuário pertence à empresa do documento
  SELECT EXISTS (
    SELECT 1 FROM public.company_documents cd
    JOIN public.user_empresa ue ON cd.company_id = ue.empresa_id
    WHERE cd.id = document_id AND ue.user_id = current_user_id
  ) INTO user_has_company_access;
  
  -- Se usuário não tem acesso à empresa, verificar se é admin
  IF NOT user_has_company_access THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = current_user_id AND (is_admin = true OR super_admin = true)
    );
  END IF;
  
  -- Verificar se o documento tem restrições de cargo
  SELECT EXISTS (
    SELECT 1 FROM public.company_document_job_roles cdjr
    WHERE cdjr.company_document_id = document_id
  ) INTO document_has_role_restrictions;
  
  -- Verificar se o documento tem restrições de usuário específico
  SELECT EXISTS (
    SELECT 1 FROM public.company_document_users cdu
    WHERE cdu.company_document_id = document_id
  ) INTO document_has_user_restrictions;
  
  -- Se não há nenhuma restrição, usuário pode acessar
  IF NOT document_has_role_restrictions AND NOT document_has_user_restrictions THEN
    RETURN true;
  END IF;
  
  -- Se há restrições de cargo, verificar se usuário tem um dos cargos necessários
  IF document_has_role_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.company_document_job_roles cdjr
      JOIN public.profiles p ON p.cargo_id = cdjr.job_role_id
      WHERE cdjr.company_document_id = document_id AND p.id = current_user_id
    ) INTO user_has_required_role;
  END IF;
  
  -- Se há restrições de usuário, verificar se usuário tem acesso específico
  IF document_has_user_restrictions THEN
    SELECT EXISTS (
      SELECT 1 FROM public.company_document_users cdu
      WHERE cdu.company_document_id = document_id AND cdu.user_id = current_user_id
    ) INTO user_has_specific_access;
  END IF;
  
  -- Usuário pode acessar se tem o cargo necessário OU acesso específico
  RETURN COALESCE(user_has_required_role, false) OR COALESCE(user_has_specific_access, false);
END;
$function$;
