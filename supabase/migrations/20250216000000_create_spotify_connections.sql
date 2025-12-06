-- Tabela para armazenar conexões do Spotify por usuário
CREATE TABLE IF NOT EXISTS public.spotify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  spotify_user_id TEXT,
  spotify_display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que cada usuário tenha apenas uma conexão
  UNIQUE(user_id)
);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_spotify_connections_user_id 
ON public.spotify_connections(user_id);

-- RLS Policies
ALTER TABLE public.spotify_connections ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver/editar suas próprias conexões
CREATE POLICY "Users can view own spotify connections"
ON public.spotify_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spotify connections"
ON public.spotify_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spotify connections"
ON public.spotify_connections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own spotify connections"
ON public.spotify_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_spotify_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spotify_connections_updated_at
BEFORE UPDATE ON public.spotify_connections
FOR EACH ROW
EXECUTE FUNCTION update_spotify_connections_updated_at();

