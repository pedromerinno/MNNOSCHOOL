# Como Fazer Deploy da Edge Function

## 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

## 2. Fazer Login

```bash
supabase login
```

## 3. Linkar ao Projeto

```bash
supabase link --project-ref gswvicwtswokyfbgoxps
```

## 4. Configurar Variáveis de Ambiente

```bash
# Para Loom (obrigatório)
supabase secrets set LOOM_API_KEY=sua_chave_aqui

# Para YouTube (opcional - se tiver serviço próprio)
supabase secrets set YT_DLP_API_URL=https://seu-servico.com
supabase secrets set YOUTUBE_AUDIO_API_URL=https://api-alternativa.com
```

## 5. Fazer Deploy

```bash
supabase functions deploy download-video-audio
```

## Alternativa: Usar Dashboard do Supabase

1. Acesse o dashboard do Supabase
2. Vá em Edge Functions
3. Crie uma nova função
4. Cole o código de `index.ts`
5. Configure as variáveis de ambiente na interface

## Testando

Após o deploy, você pode testar:

```bash
curl -X POST \
  'https://gswvicwtswokyfbgoxps.supabase.co/functions/v1/download-video-audio' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"video_url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

