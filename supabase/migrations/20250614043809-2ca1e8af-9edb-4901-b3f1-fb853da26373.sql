
-- Adicionar coluna created_by na tabela company_access para rastrear quem criou cada senha
ALTER TABLE public.company_access 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Atualizar registros existentes para definir created_by como NULL (será tratado no código)
-- Registros sem created_by só poderão ser editados por admins
