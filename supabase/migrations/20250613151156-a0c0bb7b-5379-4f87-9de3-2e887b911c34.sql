
-- Adicionar novas colunas na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN aniversario DATE,
ADD COLUMN tipo_contrato TEXT CHECK (tipo_contrato IN ('CLT', 'PJ', 'Fornecedor')),
ADD COLUMN cidade TEXT,
ADD COLUMN data_inicio DATE,
ADD COLUMN manual_cultura_aceito BOOLEAN DEFAULT FALSE,
ADD COLUMN nivel_colaborador TEXT CHECK (nivel_colaborador IN ('Junior', 'Pleno', 'Senior'));

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.profiles.aniversario IS 'Data de aniversário do colaborador';
COMMENT ON COLUMN public.profiles.tipo_contrato IS 'Tipo de contrato: CLT, PJ ou Fornecedor';
COMMENT ON COLUMN public.profiles.cidade IS 'Cidade onde o colaborador mora';
COMMENT ON COLUMN public.profiles.data_inicio IS 'Data de início do colaborador na empresa';
COMMENT ON COLUMN public.profiles.manual_cultura_aceito IS 'Se o colaborador aceitou o manual de cultura';
COMMENT ON COLUMN public.profiles.nivel_colaborador IS 'Nível do colaborador: Junior, Pleno ou Senior';
