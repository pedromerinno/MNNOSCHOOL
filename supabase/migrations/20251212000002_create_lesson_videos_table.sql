-- Criar tabela lesson_videos (relacionamento many-to-many entre lessons e videos)
CREATE TABLE IF NOT EXISTS public.lesson_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Ordem do vídeo na lesson (caso uma lesson tenha múltiplos vídeos)
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que não haja duplicatas
  UNIQUE(lesson_id, video_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_video_id ON public.lesson_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_course_id ON public.lesson_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_company_id ON public.lesson_videos(company_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_order_index ON public.lesson_videos(lesson_id, order_index);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_lesson_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_videos_updated_at
  BEFORE UPDATE ON public.lesson_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_videos_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.lesson_videos IS 'Relacionamento many-to-many entre lessons e videos. Permite que uma lesson tenha múltiplos vídeos e um vídeo seja usado em múltiplas lessons.';
COMMENT ON COLUMN public.lesson_videos.order_index IS 'Ordem do vídeo na lesson (caso uma lesson tenha múltiplos vídeos)';

-- RLS Policies
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver lesson_videos de suas empresas
CREATE POLICY "Users can view lesson_videos from their companies"
ON public.lesson_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = lesson_videos.company_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (p.is_admin = true OR p.super_admin = true)
  )
);

-- Apenas admins podem inserir/atualizar/deletar lesson_videos
CREATE POLICY "Only admins can manage lesson_videos"
ON public.lesson_videos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (p.is_admin = true OR p.super_admin = true)
  )
);
