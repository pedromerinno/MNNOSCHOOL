-- Função para buscar embeddings de vídeos usando busca vetorial (cosine similarity)
CREATE OR REPLACE FUNCTION public.search_video_embeddings(
  query_embedding vector(1536),
  company_id_param uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  video_id uuid,
  chunk_text text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.video_id,
    ve.chunk_text,
    ve.chunk_index,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM public.video_embeddings ve
  JOIN public.company_videos cv ON cv.id = ve.video_id
  WHERE 
    cv.company_id = company_id_param
    AND 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION public.search_video_embeddings IS 'Busca chunks de vídeos relevantes usando busca vetorial (cosine similarity) baseado em embeddings';
