# Setup do Sistema de Transcrição de Vídeos

## ✅ O que foi implementado

### 1. Banco de Dados
- ✅ Campos de transcrição adicionados em `company_videos`
- ✅ Tabela `video_embeddings` criada com suporte a pgvector
- ✅ Função `search_video_embeddings` para busca semântica
- ✅ RLS habilitado e políticas configuradas

### 2. APIs Backend
- ✅ `/api/transcribe-video.ts` - Transcreve vídeos usando OpenAI Whisper
- ✅ `/api/generate-embeddings.ts` - Gera embeddings das transcrições
- ✅ `/api/generate-query-embedding.ts` - Gera embeddings de queries

### 3. Edge Function
- ✅ `download-video-audio` - Baixa áudio de vídeos (YouTube e Loom)

### 4. Frontend
- ✅ Serviços de transcrição e busca semântica
- ✅ Componentes UI para status e visualização de transcrições
- ✅ Integração no VideoPlaylistManager

### 5. Integração com IA
- ✅ API de chat atualizada para usar contexto de vídeos
- ✅ Busca semântica usando embeddings

## 🔧 Configuração Necessária

### 1. Deploy da Edge Function

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Linkar ao projeto
supabase link --project-ref gswvicwtswokyfbgoxps

# Configurar variáveis de ambiente
supabase secrets set LOOM_API_KEY=sua_chave_loom_aqui

# Para YouTube (opcional - veja seção abaixo)
supabase secrets set YT_DLP_API_URL=https://seu-servico.com

# Deploy
supabase functions deploy download-video-audio
```

### 2. Configurar Variáveis de Ambiente na Vercel

Adicione no dashboard da Vercel:

- `SUPABASE_SERVICE_ROLE_KEY` - Para APIs backend acessarem o banco
- `OPENAI_API_KEY` - Já deve existir
- `LOOM_API_KEY` - Já deve existir
- `SUPABASE_URL` - `https://gswvicwtswokyfbgoxps.supabase.co`
- `SUPABASE_ANON_KEY` - Chave anon do Supabase

### 3. Configurar Serviço de Download do YouTube (Opcional mas Recomendado)

Para vídeos do YouTube funcionarem, você precisa de um dos seguintes:

#### Opção A: Usar API de Terceiros (Rápido)

1. Acesse [RapidAPI](https://rapidapi.com) ou similar
2. Procure por "YouTube Downloader" ou "yt-dlp"
3. Configure a URL e chave na Edge Function:
   ```bash
   supabase secrets set YOUTUBE_AUDIO_API_URL=https://api.exemplo.com
   ```

#### Opção B: Criar Serviço Próprio (Recomendado para Produção)

Veja o exemplo em `examples/yt-dlp-service/README.md`

## 🧪 Testando

### 1. Testar Edge Function

```bash
curl -X POST \
  'https://gswvicwtswokyfbgoxps.supabase.co/functions/v1/download-video-audio' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"video_url": "https://www.loom.com/share/VIDEO_ID"}'
```

### 2. Testar Transcrição

1. Adicione um vídeo na plataforma (via VideoPlaylistManager)
2. A transcrição deve iniciar automaticamente
3. Verifique o status na interface
4. Após conclusão, verifique se embeddings foram gerados

### 3. Testar IA com Vídeos

1. Faça uma pergunta no chat da IA relacionada ao conteúdo de um vídeo
2. A IA deve usar o contexto dos vídeos relevantes na resposta

## 📝 Notas Importantes

### Para Loom
- ✅ Funciona imediatamente após configurar `LOOM_API_KEY`
- A API do Loom fornece URL de download diretamente

### Para YouTube
- ⚠️ Requer configuração adicional de serviço de download
- Sem serviço configurado, vídeos do YouTube não serão transcritos
- Recomendado usar API de terceiros ou criar serviço próprio

### Custos
- OpenAI Whisper: ~$0.006 por minuto de áudio
- OpenAI Embeddings: ~$0.00002 por 1K tokens
- Considere limites de rate para muitos vídeos

### Performance
- Transcrição de vídeo de 10 minutos: ~1-2 minutos
- Geração de embeddings: ~5-10 segundos por vídeo
- Processamento é assíncrono, não bloqueia a UI

## 🐛 Troubleshooting

### Transcrição não inicia
- Verifique se a Edge Function foi deployada
- Verifique logs da Edge Function no dashboard do Supabase
- Verifique se `LOOM_API_KEY` está configurada

### Erro ao baixar áudio do YouTube
- Configure `YT_DLP_API_URL` ou `YOUTUBE_AUDIO_API_URL`
- Veja `examples/yt-dlp-service/README.md` para opções

### Embeddings não são gerados
- Verifique se a transcrição foi concluída
- Verifique logs da API `/api/generate-embeddings`
- Verifique se `OPENAI_API_KEY` está configurada

### IA não usa contexto de vídeos
- Verifique se embeddings foram gerados
- Verifique logs da API `/api/chat`
- Verifique se a função `search_video_embeddings` existe no banco

## 📚 Documentação Adicional

- Edge Function: `supabase/functions/download-video-audio/README.md`
- Deploy: `supabase/functions/download-video-audio/DEPLOY.md`
- Exemplo yt-dlp: `examples/yt-dlp-service/README.md`
