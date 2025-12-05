# Serviço yt-dlp para Download de Áudio do YouTube

Este é um exemplo de como criar um serviço simples usando yt-dlp para baixar áudio de vídeos do YouTube.

## Opções de Implementação

### Opção 1: Usar Serviço Existente (Mais Rápido)

Existem vários serviços públicos que você pode usar:

- **RapidAPI**: Várias APIs de extração de YouTube disponíveis
- **YouTube-DL API**: Serviços hospedados que fornecem yt-dlp como API
- **Serviços próprios**: Crie seu próprio usando as opções abaixo

### Opção 2: Criar Serviço Próprio com Vercel

Crie um novo projeto Vercel e adicione:

**`api/download.ts`**:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { url, format = 'bestaudio' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    // Nota: yt-dlp precisa estar instalado no ambiente
    // Em Vercel, você pode usar Docker ou instalar via build
    const command = `yt-dlp -f ${format} -o - "${url}"`;
    
    const { stdout } = await execAsync(command);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(stdout, 'binary'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

**Nota**: Esta abordagem requer yt-dlp instalado no ambiente Vercel, o que pode ser complicado.

### Opção 3: Usar Docker + Serviço Externo (Recomendado)

Crie um serviço separado usando Docker que roda yt-dlp:

1. Crie um repositório com Dockerfile
2. Deploy em um serviço que suporta Docker (Railway, Render, etc.)
3. Configure a URL no `YT_DLP_API_URL`

### Opção 4: Usar API de Terceiros (Mais Simples)

Para começar rapidamente, você pode usar uma API de terceiros:

1. **RapidAPI**: Procure por "YouTube Downloader" ou "yt-dlp"
2. Configure a URL e chave da API
3. Atualize a Edge Function para usar essa API

## Configuração na Edge Function

Após ter seu serviço configurado, atualize a variável de ambiente:

```bash
supabase secrets set YT_DLP_API_URL=https://seu-servico.com
```

## Recomendação

Para produção, recomendo:
1. **Curto prazo**: Usar uma API de terceiros (RapidAPI)
2. **Longo prazo**: Criar seu próprio serviço usando Docker + yt-dlp em um provedor como Railway ou Render
