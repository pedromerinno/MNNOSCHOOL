-- Habilitar extensão pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Adicionar campos de transcrição na tabela company_videos
ALTER TABLE public.company_videos
ADD COLUMN IF NOT EXISTS transcription_text TEXT,
ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS transcription_error TEXT,
ADD COLUMN IF NOT EXISTS transcribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transcription_metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índice para busca por status de transcrição
CREATE INDEX IF NOT EXISTS idx_company_videos_transcription_status 
ON public.company_videos(transcription_status);

-- Criar índice para busca por company_id e status (para processar vídeos pendentes)
CREATE INDEX IF NOT EXISTS idx_company_videos_company_status 
ON public.company_videos(company_id, transcription_status);

-- Comentários para documentação
COMMENT ON COLUMN public.company_videos.transcription_text IS 'Texto completo da transcrição do vídeo';
COMMENT ON COLUMN public.company_videos.transcription_status IS 'Status do processo de transcrição: pending, processing, completed, failed';
COMMENT ON COLUMN public.company_videos.transcription_error IS 'Mensagem de erro caso a transcrição falhe';
COMMENT ON COLUMN public.company_videos.transcribed_at IS 'Data e hora em que a transcrição foi concluída';
COMMENT ON COLUMN public.company_videos.transcription_metadata IS 'Metadados adicionais da transcrição (duração processada, idioma detectado, etc.)';
