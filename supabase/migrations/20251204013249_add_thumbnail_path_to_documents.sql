-- Adicionar coluna thumbnail_path na tabela user_documents
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT NULL;

-- Adicionar coluna thumbnail_path na tabela company_documents
ALTER TABLE public.company_documents 
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.user_documents.thumbnail_path IS 'Caminho do arquivo thumbnail gerado automaticamente no upload';
COMMENT ON COLUMN public.company_documents.thumbnail_path IS 'Caminho do arquivo thumbnail gerado automaticamente no upload';


