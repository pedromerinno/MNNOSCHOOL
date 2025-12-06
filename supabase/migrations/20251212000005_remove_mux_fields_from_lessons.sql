-- Remover campos mux_* de lessons
-- Agora os vídeos são gerenciados na tabela videos e linkados via lesson_videos

-- Remover índices relacionados
DROP INDEX IF EXISTS idx_lessons_mux_upload_id;
DROP INDEX IF EXISTS idx_lessons_mux_asset_id;
DROP INDEX IF EXISTS idx_lessons_mux_status;

-- Remover colunas
ALTER TABLE public.lessons
DROP COLUMN IF EXISTS mux_asset_id,
DROP COLUMN IF EXISTS mux_playback_id,
DROP COLUMN IF EXISTS mux_upload_id,
DROP COLUMN IF EXISTS mux_status,
DROP COLUMN IF EXISTS mux_duration,
DROP COLUMN IF EXISTS mux_thumbnail_url;

-- Comentário de documentação
COMMENT ON TABLE public.lessons IS 'Aulas de cursos. Vídeos são gerenciados na tabela videos e linkados via lesson_videos.';
