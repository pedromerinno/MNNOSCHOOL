# Edge Function: Download Video Audio

Esta Edge Function baixa o áudio de vídeos do YouTube e Loom para transcrição.

## Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Edge Function:

- `LOOM_API_KEY` (obrigatório para Loom): Chave da API do Loom
- `YT_DLP_API_URL` (opcional para YouTube): URL do serviço yt-dlp próprio
- `YOUTUBE_AUDIO_API_URL` (opcional para YouTube): URL alternativa de API de extração de áudio

### Para YouTube

Para funcionar com vídeos do YouTube, você precisa configurar um dos seguintes:

1. **Serviço yt-dlp próprio** (recomendado):
   - Configure `YT_DLP_API_URL` apontando para seu serviço yt-dlp
   - Exemplo: `https://seu-yt-dlp-api.vercel.app`

2. **API alternativa**:
   - Configure `YOUTUBE_AUDIO_API_URL` apontando para um serviço de extração de áudio
   - Exemplo: `https://api.exemplo.com/youtube/audio`

### Para Loom

Apenas configure `LOOM_API_KEY` com sua chave da API do Loom.

## Uso

```typescript
const response = await fetch('https://gswvicwtswokyfbgoxps.supabase.co/functions/v1/download-video-audio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: JSON.stringify({
    video_url: 'https://www.youtube.com/watch?v=VIDEO_ID'
  }),
});

const data = await response.json();
// data.audio_base64 contém o áudio em base64
```

## Resposta

```json
{
  "success": true,
  "audio_base64": "...",
  "audio_size": 1234567,
  "video_type": "youtube" | "loom"
}
```

## Notas

- O áudio é retornado em base64 para facilitar a transmissão
- Para vídeos longos, o download pode demorar
- Certifique-se de que os serviços configurados suportam o formato de áudio necessário
