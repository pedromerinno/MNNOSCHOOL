-- Adicionar campos de transcrição na tabela lessons
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS transcription_text TEXT,
ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS transcription_error TEXT,
ADD COLUMN IF NOT EXISTS transcribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transcription_metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índice para busca por status de transcrição
CREATE INDEX IF NOT EXISTS idx_lessons_transcription_status 
ON public.lessons(transcription_status);

-- Criar índice para busca por course_id e status (para processar aulas pendentes)
CREATE INDEX IF NOT EXISTS idx_lessons_course_status 
ON public.lessons(course_id, transcription_status);

-- Criar índice para buscar apenas aulas de vídeo que precisam de transcrição
CREATE INDEX IF NOT EXISTS idx_lessons_video_pending 
ON public.lessons(course_id, transcription_status, type) 
WHERE type = 'video' AND transcription_status = 'pending';

-- Comentários para documentação
COMMENT ON COLUMN public.lessons.transcription_text IS 'Texto completo da transcrição do vídeo da aula';
COMMENT ON COLUMN public.lessons.transcription_status IS 'Status do processo de transcrição: pending, processing, completed, failed';
COMMENT ON COLUMN public.lessons.transcription_error IS 'Mensagem de erro caso a transcrição falhe';
COMMENT ON COLUMN public.lessons.transcribed_at IS 'Data e hora em que a transcrição foi concluída';
COMMENT ON COLUMN public.lessons.transcription_metadata IS 'Metadados adicionais da transcrição (duração processada, idioma detectado, etc.)';
