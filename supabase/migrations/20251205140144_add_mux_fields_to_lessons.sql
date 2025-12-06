-- Adicionar campos Mux na tabela lessons
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS mux_asset_id TEXT,
ADD COLUMN IF NOT EXISTS mux_playback_id TEXT,
ADD COLUMN IF NOT EXISTS mux_upload_id TEXT,
ADD COLUMN IF NOT EXISTS mux_status TEXT CHECK (mux_status IN ('waiting', 'preparing', 'ready', 'errored')),
ADD COLUMN IF NOT EXISTS mux_duration NUMERIC,
ADD COLUMN IF NOT EXISTS mux_thumbnail_url TEXT;

-- Criar índices para busca e performance
CREATE INDEX IF NOT EXISTS idx_lessons_mux_upload_id 
ON public.lessons(mux_upload_id) 
WHERE mux_upload_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_mux_asset_id 
ON public.lessons(mux_asset_id) 
WHERE mux_asset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_mux_status 
ON public.lessons(mux_status) 
WHERE mux_status IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.lessons.mux_asset_id IS 'ID do asset no Mux após processamento';
COMMENT ON COLUMN public.lessons.mux_playback_id IS 'ID de playback público do Mux para streaming';
COMMENT ON COLUMN public.lessons.mux_upload_id IS 'ID do upload direto no Mux (temporário, usado para webhook)';
COMMENT ON COLUMN public.lessons.mux_status IS 'Status do processamento do vídeo no Mux: waiting, preparing, ready, errored';
COMMENT ON COLUMN public.lessons.mux_duration IS 'Duração do vídeo em segundos (extraído do Mux)';
COMMENT ON COLUMN public.lessons.mux_thumbnail_url IS 'URL do thumbnail gerado automaticamente pelo Mux';

