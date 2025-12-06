-- Criar tabela videos (entidade global para Mux, transcrição, embeddings)
-- Separada de company_videos que é para vídeos institucionais
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'mux' CHECK (source IN ('mux', 'youtube', 'loom', 'vimeo')),
  
  -- Campos Mux
  mux_upload_id TEXT,
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  mux_status TEXT CHECK (mux_status IN ('uploading', 'preparing', 'ready', 'errored')),
  mux_duration NUMERIC,
  mux_thumbnail_url TEXT,
  
  -- Metadados
  title TEXT,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_videos_company_id ON public.videos(company_id);
CREATE INDEX IF NOT EXISTS idx_videos_mux_upload_id ON public.videos(mux_upload_id) WHERE mux_upload_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_mux_asset_id ON public.videos(mux_asset_id) WHERE mux_asset_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_mux_status ON public.videos(mux_status) WHERE mux_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_created_by ON public.videos(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_source ON public.videos(source);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_videos_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.videos IS 'Tabela global de vídeos (Mux, transcrição, embeddings). Separada de company_videos que é para vídeos institucionais.';
COMMENT ON COLUMN public.videos.source IS 'Origem do vídeo: mux, youtube, loom, vimeo';
COMMENT ON COLUMN public.videos.mux_upload_id IS 'ID do upload direto no Mux (temporário, usado para webhook)';
COMMENT ON COLUMN public.videos.mux_asset_id IS 'ID do asset no Mux após processamento';
COMMENT ON COLUMN public.videos.mux_playback_id IS 'ID de playback público do Mux para streaming';
COMMENT ON COLUMN public.videos.mux_status IS 'Status do processamento do vídeo no Mux: uploading, preparing, ready, errored';
COMMENT ON COLUMN public.videos.mux_duration IS 'Duração do vídeo em segundos (extraído do Mux)';
COMMENT ON COLUMN public.videos.mux_thumbnail_url IS 'URL do thumbnail gerado automaticamente pelo Mux';

-- RLS Policies
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver vídeos de suas empresas
CREATE POLICY "Users can view videos from their companies"
ON public.videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid() 
    AND ue.empresa_id = videos.company_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.super_admin = true
  )
);

-- Apenas admins podem inserir/atualizar/deletar vídeos
CREATE POLICY "Only admins can manage videos"
ON public.videos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.super_admin = true
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_empresa ue
    WHERE ue.user_id = auth.uid()
    AND ue.empresa_id = videos.company_id
    AND ue.is_admin = true
  )
);
