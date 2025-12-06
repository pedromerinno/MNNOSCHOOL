-- Atualizar video_embeddings para apontar para videos.id em vez de company_videos.id
-- Primeiro, remover a constraint antiga
ALTER TABLE public.video_embeddings
DROP CONSTRAINT IF EXISTS video_embeddings_video_id_fkey;

-- Adicionar nova constraint apontando para videos
ALTER TABLE public.video_embeddings
ADD CONSTRAINT video_embeddings_video_id_fkey
FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;

-- Atualizar comentários
COMMENT ON COLUMN public.video_embeddings.video_id IS 'Referência ao vídeo global (tabela videos)';
