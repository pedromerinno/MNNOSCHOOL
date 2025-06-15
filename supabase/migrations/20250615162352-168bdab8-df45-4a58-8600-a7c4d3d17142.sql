
-- Criar tabela para sugestões de cursos
CREATE TABLE public.user_course_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Evitar sugestões duplicadas do mesmo curso para o mesmo usuário na mesma empresa
  UNIQUE(user_id, course_id, company_id)
);

-- Habilitar RLS
ALTER TABLE public.user_course_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para visualizar sugestões - usuários podem ver suas próprias sugestões e admins podem ver todas
CREATE POLICY "Users can view their own course suggestions" 
  ON public.user_course_suggestions 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_user_admin_or_super_admin()
  );

-- Política para criar sugestões - apenas admins podem criar sugestões
CREATE POLICY "Admins can create course suggestions" 
  ON public.user_course_suggestions 
  FOR INSERT 
  WITH CHECK (public.is_user_admin_or_super_admin());

-- Política para deletar sugestões - apenas admins podem deletar sugestões
CREATE POLICY "Admins can delete course suggestions" 
  ON public.user_course_suggestions 
  FOR DELETE 
  USING (public.is_user_admin_or_super_admin());

-- Criar índices para melhor performance
CREATE INDEX idx_user_course_suggestions_user_id ON public.user_course_suggestions(user_id);
CREATE INDEX idx_user_course_suggestions_company_id ON public.user_course_suggestions(company_id);
CREATE INDEX idx_user_course_suggestions_course_id ON public.user_course_suggestions(course_id);
