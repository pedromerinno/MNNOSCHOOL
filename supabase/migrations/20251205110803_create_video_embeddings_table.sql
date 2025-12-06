-- Criar tabela para armazenar embeddings dos vídeos (RAG)
CREATE TABLE IF NOT EXISTS public.video_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.company_videos(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI embeddings usa 1536 dimensões
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que não haja chunks duplicados para o mesmo vídeo
  UNIQUE(video_id, chunk_index)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_video_embeddings_video_id 
ON public.video_embeddings(video_id);

CREATE INDEX IF NOT EXISTS idx_video_embeddings_created_at 
ON public.video_embeddings(created_at);

-- Índice para busca vetorial (usando pgvector)
-- Este índice será usado para busca semântica
CREATE INDEX IF NOT EXISTS idx_video_embeddings_embedding 
ON public.video_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Comentários para documentação
COMMENT ON TABLE public.video_embeddings IS 'Armazena chunks de transcrições de vídeos com seus embeddings para busca semântica (RAG)';
COMMENT ON COLUMN public.video_embeddings.video_id IS 'Referência ao vídeo da empresa';
COMMENT ON COLUMN public.video_embeddings.chunk_text IS 'Pedaço da transcrição (aproximadamente 500 tokens)';
COMMENT ON COLUMN public.video_embeddings.chunk_index IS 'Índice sequencial do chunk na transcrição';
COMMENT ON COLUMN public.video_embeddings.embedding IS 'Embedding vetorial do texto (1536 dimensões - OpenAI)';

-- RLS Policies para video_embeddings
-- Usuários podem ver embeddings de vídeos de suas empresas
CREATE POLICY "Users can view embeddings from their company videos"
ON public.video_embeddings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_videos cv
    JOIN public.user_empresa ue ON ue.empresa_id = cv.company_id
    WHERE cv.id = video_embeddings.video_id
    AND ue.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_videos cv
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE cv.id = video_embeddings.video_id
    AND (p.is_admin = true OR p.super_admin = true)
  )
);

-- Apenas admins podem inserir/atualizar/deletar embeddings
CREATE POLICY "Only admins can manage embeddings"
ON public.video_embeddings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (p.is_admin = true OR p.super_admin = true)
  )
);

