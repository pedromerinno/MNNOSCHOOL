
-- Criar tabela para documentos da empresa
CREATE TABLE public.company_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NULL,
  file_type TEXT NULL,
  document_type TEXT NOT NULL,
  description TEXT NULL,
  link_url TEXT NULL,
  attachment_type TEXT NOT NULL DEFAULT 'file',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para vincular documentos da empresa aos cargos
CREATE TABLE public.company_document_job_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_document_id UUID NOT NULL,
  job_role_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_document_id, job_role_id)
);

-- Adicionar índices para performance
CREATE INDEX idx_company_documents_company_id ON public.company_documents(company_id);
CREATE INDEX idx_company_documents_document_type ON public.company_documents(document_type);
CREATE INDEX idx_company_document_job_roles_document_id ON public.company_document_job_roles(company_document_id);
CREATE INDEX idx_company_document_job_roles_job_role_id ON public.company_document_job_roles(job_role_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_document_job_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_documents
-- Usuários podem ver documentos da empresa se pertencerem à empresa
CREATE POLICY "Users can view company documents from their companies" 
  ON public.company_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_empresa 
      WHERE user_id = auth.uid() AND empresa_id = company_id
    )
  );

-- Admins podem inserir documentos da empresa
CREATE POLICY "Admins can create company documents" 
  ON public.company_documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_empresa ue ON p.id = ue.user_id
      WHERE p.id = auth.uid() 
      AND ue.empresa_id = company_id
      AND (p.is_admin = true OR p.super_admin = true)
    )
  );

-- Admins podem atualizar documentos da empresa
CREATE POLICY "Admins can update company documents" 
  ON public.company_documents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_empresa ue ON p.id = ue.user_id
      WHERE p.id = auth.uid() 
      AND ue.empresa_id = company_id
      AND (p.is_admin = true OR p.super_admin = true)
    )
  );

-- Admins podem deletar documentos da empresa
CREATE POLICY "Admins can delete company documents" 
  ON public.company_documents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_empresa ue ON p.id = ue.user_id
      WHERE p.id = auth.uid() 
      AND ue.empresa_id = company_id
      AND (p.is_admin = true OR p.super_admin = true)
    )
  );

-- Políticas RLS para company_document_job_roles
-- Usuários podem ver vínculos de documentos da empresa
CREATE POLICY "Users can view company document job role links" 
  ON public.company_document_job_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM company_documents cd
      JOIN user_empresa ue ON cd.company_id = ue.empresa_id
      WHERE cd.id = company_document_id 
      AND ue.user_id = auth.uid()
    )
  );

-- Admins podem gerenciar vínculos de documentos da empresa
CREATE POLICY "Admins can manage company document job role links" 
  ON public.company_document_job_roles 
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

-- Adicionar função para verificar se usuário pode acessar documento da empresa
CREATE OR REPLACE FUNCTION public.user_can_access_company_document(document_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_has_company_access boolean := false;
  document_has_role_restrictions boolean := false;
  user_has_required_role boolean := false;
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
  
  -- Se não há restrições de cargo, usuário pode acessar
  IF NOT document_has_role_restrictions THEN
    RETURN true;
  END IF;
  
  -- Verificar se usuário tem um dos cargos necessários
  SELECT EXISTS (
    SELECT 1 FROM public.company_document_job_roles cdjr
    JOIN public.profiles p ON p.cargo_id = cdjr.job_role_id
    WHERE cdjr.company_document_id = document_id AND p.id = current_user_id
  ) INTO user_has_required_role;
  
  RETURN user_has_required_role;
END;
$function$;

-- Expandir tipos de documento para incluir novos tipos da empresa
-- (Manteremos compatibilidade com tipos existentes)
