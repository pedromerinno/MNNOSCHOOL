import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GenerateEmbeddingRequest {
  query: string;
}

/**
 * Gera embedding para uma query usando OpenAI Embeddings API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query }: GenerateEmbeddingRequest = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query é obrigatório e deve ser uma string' });
    }

    const embedding = await generateEmbedding(query);

    return res.status(200).json({
      embedding,
    });
  } catch (error: any) {
    console.error('[GenerateEmbedding] Erro ao gerar embedding:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar embedding',
    });
  }
}

