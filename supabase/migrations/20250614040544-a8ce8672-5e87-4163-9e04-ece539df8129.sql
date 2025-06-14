
-- Criar tabela para senhas pessoais dos colaboradores
CREATE TABLE public.user_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para que usuários vejam apenas suas próprias senhas
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias senhas
CREATE POLICY "Users can view their own access" 
  ON public.user_access 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários criem suas próprias senhas
CREATE POLICY "Users can create their own access" 
  ON public.user_access 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que usuários atualizem suas próprias senhas
CREATE POLICY "Users can update their own access" 
  ON public.user_access 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para que usuários excluam suas próprias senhas
CREATE POLICY "Users can delete their own access" 
  ON public.user_access 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar índice para melhor performance
CREATE INDEX idx_user_access_user_id ON public.user_access(user_id);
