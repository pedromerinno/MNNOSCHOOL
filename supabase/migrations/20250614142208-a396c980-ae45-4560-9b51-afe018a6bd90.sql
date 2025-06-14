
-- Criar tabela para armazenar convites de usuários
CREATE TABLE public.user_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cidade TEXT,
  aniversario DATE,
  data_inicio DATE,
  tipo_contrato TEXT CHECK (tipo_contrato IN ('CLT', 'PJ', 'Fornecedor')),
  nivel_colaborador TEXT CHECK (nivel_colaborador IN ('Junior', 'Pleno', 'Senior')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para otimizar buscas
CREATE INDEX idx_user_invites_email ON public.user_invites(email);
CREATE INDEX idx_user_invites_company_id ON public.user_invites(company_id);
CREATE INDEX idx_user_invites_expires_at ON public.user_invites(expires_at);
CREATE INDEX idx_user_invites_used ON public.user_invites(used);

-- Habilitar RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Função segura para verificar se usuário é admin ou super admin
CREATE OR REPLACE FUNCTION public.is_user_admin_for_invites()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_is_admin boolean;
  user_is_super_admin boolean;
BEGIN
  SELECT 
    COALESCE(is_admin, false),
    COALESCE(super_admin, false)
  INTO user_is_admin, user_is_super_admin
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_is_admin, false) OR COALESCE(user_is_super_admin, false);
END;
$$;

-- Política para admins e super admins poderem criar e ver convites das suas empresas
CREATE POLICY "Admins can manage invites for their companies" 
  ON public.user_invites 
  FOR ALL 
  USING (
    public.is_user_admin_for_invites()
  );

-- Política para usuários verificarem convites pelo próprio email
CREATE POLICY "Users can check their own invites" 
  ON public.user_invites 
  FOR SELECT
  USING (
    email = (
      SELECT p.email 
      FROM profiles p 
      WHERE p.id = auth.uid()
    )
  );
