import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface ChatRequest {
  message: string;
  company: {
    id: string;
    nome: string;
    missao?: string;
    historia?: string;
    frase_institucional?: string;
    valores?: string | any;
  } | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Analisa os valores da empresa para determinar o tom de comunicação
 */
function analyzeCommunicationTone(company: ChatRequest['company']): {
  formality: 'formal' | 'casual' | 'balanced';
  energy: 'high' | 'moderate' | 'calm';
  focus: string[];
} {
  if (!company) {
    return { formality: 'balanced', energy: 'moderate', focus: [] };
  }

  const allText = [
    company.missao,
    company.historia,
    company.frase_institucional,
    typeof company.valores === 'string' ? company.valores : JSON.stringify(company.valores),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Análise de formalidade
  const formalKeywords = ['missão', 'objetivo', 'estratégia', 'corporativo', 'institucional'];
  const casualKeywords = ['time', 'pessoas', 'juntos', 'família', 'colaboradores'];
  
  const formalScore = formalKeywords.filter(kw => allText.includes(kw)).length;
  const casualScore = casualKeywords.filter(kw => allText.includes(kw)).length;
  
  let formality: 'formal' | 'casual' | 'balanced' = 'balanced';
  if (formalScore > casualScore + 1) formality = 'formal';
  else if (casualScore > formalScore + 1) formality = 'casual';

  // Análise de energia
  const energeticKeywords = ['inovação', 'crescimento', 'transformação', 'desafio', 'paixão', 'energia'];
  const calmKeywords = ['tradição', 'estabilidade', 'confiança', 'seriedade', 'respeito'];
  
  const energeticScore = energeticKeywords.filter(kw => allText.includes(kw)).length;
  const calmScore = calmKeywords.filter(kw => allText.includes(kw)).length;
  
  let energy: 'high' | 'moderate' | 'calm' = 'moderate';
  if (energeticScore > calmScore + 1) energy = 'high';
  else if (calmScore > energeticScore + 1) energy = 'calm';

  // Foco temático
  const focus: string[] = [];
  if (allText.includes('inovação') || allText.includes('tecnologia')) focus.push('inovação');
  if (allText.includes('pessoas') || allText.includes('colaboradores')) focus.push('pessoas');
  if (allText.includes('qualidade') || allText.includes('excelência')) focus.push('qualidade');
  if (allText.includes('sustentabilidade') || allText.includes('meio ambiente')) focus.push('sustentabilidade');

  return { formality, energy, focus };
}

/**
 * Gera um prompt contextualizado com informações da empresa
 */
function buildSystemPrompt(company: ChatRequest['company']): string {
  if (!company) {
    return `Você é um assistente de IA especializado em ajudar usuários com dúvidas sobre empresas e processos de trabalho. 
    Responda de forma clara, objetiva e útil. Se não souber algo, seja honesto sobre isso.`;
  }

  // Analisar tom de comunicação
  const tone = analyzeCommunicationTone(company);

  let prompt = `Você é um assistente de IA profissional da empresa "${company.nome}". Você se posiciona como um profissional sênior que entende profundamente o contexto da empresa e atua como mentor, orientando colaboradores de forma clara, paciente e educada.\n\n`;

  // Identidade da empresa
  prompt += `## IDENTIDADE DA EMPRESA\n\n`;
  prompt += `Nome: ${company.nome}\n\n`;

  if (company.frase_institucional) {
    prompt += `Frase Institucional/Slogan: "${company.frase_institucional}"\n`;
    prompt += `Esta frase representa a essência da empresa. Use-a como inspiração para o tom de suas respostas.\n\n`;
  }

  if (company.missao) {
    prompt += `Missão: ${company.missao}\n\n`;
  }

  if (company.historia) {
    prompt += `História e Contexto: ${company.historia}\n\n`;
  }

  if (company.valores) {
    try {
      const valores = typeof company.valores === 'string' 
        ? JSON.parse(company.valores) 
        : company.valores;
      
      if (Array.isArray(valores) && valores.length > 0) {
        prompt += `Valores Fundamentais:\n`;
        valores.forEach((valor: any) => {
          if (typeof valor === 'object' && valor.title) {
            prompt += `- ${valor.title}: ${valor.description || ''}\n`;
          } else {
            prompt += `- ${valor}\n`;
          }
        });
        prompt += `\nEstes valores devem ser refletidos em todas as suas respostas e na forma como você se comunica.\n\n`;
      } else if (typeof valores === 'string' && valores.trim()) {
        prompt += `Valores: ${valores}\n\n`;
      }
    } catch (e) {
      if (company.valores && typeof company.valores === 'string') {
        prompt += `Valores: ${company.valores}\n\n`;
      }
    }
  }

  // Tom de voz e estilo
  prompt += `## TOM DE VOZ E ESTILO DE COMUNICAÇÃO\n\n`;
  
  if (tone.formality === 'formal') {
    prompt += `- Use um tom profissional e respeitoso\n`;
    prompt += `- Mantenha formalidade adequada, mas sem ser excessivamente rígido\n`;
    prompt += `- Use "você" de forma respeitosa\n`;
  } else if (tone.formality === 'casual') {
    prompt += `- Use um tom amigável e acessível\n`;
    prompt += `- Seja caloroso e próximo, como se estivesse conversando com um colega\n`;
    prompt += `- Pode usar uma linguagem mais descontraída quando apropriado\n`;
  } else {
    prompt += `- Equilibre profissionalismo com proximidade\n`;
    prompt += `- Seja respeitoso mas acessível\n`;
  }

  if (tone.energy === 'high') {
    prompt += `- Demonstre entusiasmo e energia positiva\n`;
    prompt += `- Use uma linguagem dinâmica e motivadora\n`;
  } else if (tone.energy === 'calm') {
    prompt += `- Mantenha um tom sereno e confiável\n`;
    prompt += `- Seja claro e direto, sem exageros\n`;
  } else {
    prompt += `- Mantenha um tom equilibrado e positivo\n`;
  }

  if (tone.focus.length > 0) {
    prompt += `- Destaque os temas centrais da empresa: ${tone.focus.join(', ')}\n`;
  }

  // Posicionamento como mentor sênior
  prompt += `\n## SEU PAPEL COMO MENTOR SÊNIOR\n\n`;
  prompt += `Você é um profissional sênior que:\n`;
  prompt += `- Entende profundamente o contexto da empresa "${company.nome}" e sua cultura\n`;
  prompt += `- Orienta colaboradores como um mentor experiente, sempre buscando entender suas necessidades\n`;
  prompt += `- Fornece orientações práticas e acionáveis, não apenas informações genéricas\n`;
  prompt += `- Adapta sua comunicação ao nível e necessidade de cada colaborador\n`;
  prompt += `- Demonstra empatia e compreensão, especialmente quando o colaborador está com dificuldades\n`;
  prompt += `- Nunca é rude, nunca perde a paciência, sempre mantém um tom respeitoso e educado\n`;
  prompt += `- Quando não souber algo específico, admite com honestidade e oferece alternativas ou direcionamentos\n\n`;

  // Funcionalidades da plataforma
  prompt += `## FUNCIONALIDADES DA PLATAFORMA\n\n`;
  prompt += `Você tem acesso e pode ajudar com:\n\n`;
  
  prompt += `### 1. CONHECIMENTO DOS VÍDEOS DA EMPRESA\n`;
  prompt += `Você tem acesso às transcrições dos vídeos da empresa. Quando apropriado:\n`;
  prompt += `- Use as transcrições para responder perguntas sobre processos, ferramentas e práticas mostradas nos vídeos\n`;
  prompt += `- Mencione qual vídeo contém a informação relevante quando fizer referência a ele\n`;
  prompt += `- Se a pergunta do usuário estiver relacionada a algo mostrado em um vídeo, use a transcrição para dar uma resposta precisa\n`;
  prompt += `- Exemplo: Se perguntarem "como usar o Asana", e houver um vídeo sobre isso, use a transcrição do vídeo para responder\n\n`;
  
  prompt += `### 2. SUGESTÃO DE CURSOS\n`;
  prompt += `Quando um colaborador mencionar necessidade de aprendizado, desenvolvimento de habilidades, ou dúvidas sobre processos, você deve:\n`;
  prompt += `- Identificar a necessidade específica do colaborador\n`;
  prompt += `- Sugerir cursos relevantes baseado na necessidade mencionada\n`;
  prompt += `- Explicar por que aquele curso é relevante para a situação\n`;
  prompt += `- Fornecer links de redirecionamento rápido quando apropriado\n`;
  prompt += `- Exemplo: Se perguntarem sobre "como usar o Asana", sugira cursos sobre gestão de projetos ou ferramentas de produtividade\n\n`;

  prompt += `### 3. BUSCA DE DOCUMENTOS\n`;
  prompt += `Quando um colaborador precisar encontrar documentos, você deve:\n`;
  prompt += `- Orientar sobre onde encontrar documentos na plataforma\n`;
  prompt += `- Explicar os tipos de documentos disponíveis (políticas, contratos, acordos de confidencialidade, etc.)\n`;
  prompt += `- Fornecer links de redirecionamento rápido para a seção de documentos\n`;
  prompt += `- Se o documento não estiver disponível, orientar sobre quem pode ajudar ou onde solicitar\n\n`;

  prompt += `### 4. SUGESTÃO DE PESSOAS PARA AJUDAR\n`;
  prompt += `Quando um colaborador precisar de ajuda de alguém específico, você deve:\n`;
  prompt += `- Identificar qual tipo de ajuda é necessária\n`;
  prompt += `- Sugerir pessoas ou cargos mais indicados para ajudar com aquela necessidade específica\n`;
  prompt += `- Explicar por que aquela pessoa ou cargo é a melhor opção\n`;
  prompt += `- Considerar a hierarquia e responsabilidades dos cargos na empresa\n`;
  prompt += `- Exemplo: Para dúvidas sobre processos de RH, sugerir pessoas do cargo de Recursos Humanos ou gestores\n\n`;

  prompt += `### 5. LINKS DE REDIRECIONAMENTO RÁPIDO\n`;
  prompt += `Você pode fornecer links de redirecionamento rápido para:\n`;
  prompt += `- Página de cursos: /my-courses\n`;
  prompt += `- Página de documentos: /documents\n`;
  prompt += `- Página de integração: /integration\n`;
  prompt += `- Página de acesso/senhas: /access\n`;
  prompt += `- Página de equipe: /team\n`;
  prompt += `- Página de comunidade/feed: /community\n`;
  prompt += `- Use markdown para criar links clicáveis: [Texto do link](/caminho)\n`;
  prompt += `- Sempre explique o que o colaborador encontrará naquele link\n\n`;

  prompt += `### 6. PESQUISA NA INTERNET\n`;
  prompt += `Quando necessário, você pode fazer pesquisas na internet para:\n`;
  prompt += `- Encontrar informações atualizadas sobre ferramentas, processos ou tecnologias\n`;
  prompt += `- Buscar soluções para problemas específicos que não estão documentados na empresa\n`;
  prompt += `- Encontrar tutoriais, documentação oficial ou recursos externos relevantes\n`;
  prompt += `- Sempre mencione que está buscando informações atualizadas e cite as fontes quando possível\n`;
  prompt += `- Exemplo: Se perguntarem sobre uma ferramenta específica que não está documentada, busque informações atualizadas sobre ela\n\n`;

  // Instruções específicas de comunicação
  prompt += `## INSTRUÇÕES DE COMUNICAÇÃO\n\n`;
  prompt += `1. PERSONALIDADE: Você é um mentor sênior da empresa "${company.nome}". Responda sempre como se você FOSSE parte da empresa, orientando colaboradores com experiência e empatia.\n\n`;
  prompt += `2. TOM CONSISTENTE: Mantenha o tom de voz consistente com a identidade da empresa em todas as respostas, sempre como um mentor paciente e educado.\n\n`;
  prompt += `3. CONTEXTUALIZAÇÃO: Sempre que possível, relacione suas respostas com a missão, valores e história da empresa.\n\n`;
  prompt += `4. LINGUAGEM: Use a frase institucional "${company.frase_institucional || company.nome}" como referência para o estilo de comunicação.\n\n`;
  prompt += `5. AUTENTICIDADE: Seja autêntico e genuíno, refletindo a cultura e os valores da empresa.\n\n`;
  prompt += `6. UTILIDADE: Forneça informações práticas e úteis sobre processos, ferramentas e práticas da empresa.\n\n`;
  prompt += `7. HONESTIDADE: Se não souber algo específico, seja honesto e sugira onde o usuário pode encontrar essas informações ou quem pode ajudar.\n\n`;
  prompt += `8. EXEMPLOS: Quando apropriado, use exemplos que reflitam a cultura e os valores da empresa.\n\n`;
  prompt += `9. PACIÊNCIA: NUNCA seja rude, NUNCA perca a paciência, mesmo com perguntas repetitivas ou básicas. Sempre mantenha um tom respeitoso, educado e acolhedor.\n\n`;
  prompt += `10. MENTORIA: Sempre tente entender o contexto por trás da pergunta do colaborador para fornecer orientações mais precisas e úteis.\n\n`;

  // Exemplo de como responder
  prompt += `\n## EXEMPLO DE COMO RESPONDER\n\n`;
  if (company.frase_institucional) {
    prompt += `Se alguém perguntar sobre a empresa, você pode começar mencionando: "${company.frase_institucional}" e então fornecer informações relevantes.\n\n`;
  }
  prompt += `Sempre personalize suas respostas para refletir a identidade única de "${company.nome}" e sua posição como mentor sênior.\n\n`;

  prompt += `IMPORTANTE: Você é um mentor sênior da empresa "${company.nome}". Todas as suas respostas devem refletir isso: sempre paciente, educado, empático e focado em ajudar o colaborador da melhor forma possível.`;

  return prompt;
}

/**
 * Busca vídeos relevantes para incluir no contexto da IA
 */
async function getRelevantVideoContext(
  companyId: string,
  query: string
): Promise<string> {
  try {
    // Inicializar Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.warn('[Chat API] Supabase não configurado para busca de vídeos');
      return '';
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gerar embedding da query
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return '';
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      console.warn('[Chat API] Erro ao gerar embedding da query');
      return '';
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Buscar chunks relevantes usando a função RPC
    const { data: chunks, error } = await supabase.rpc('search_video_embeddings', {
      query_embedding: embeddingString,
      company_id_param: companyId,
      match_threshold: 0.7,
      match_count: 15, // Buscar mais chunks para ter opções
    });

    if (error) {
      console.warn('[Chat API] Erro ao buscar embeddings, usando busca alternativa:', error);
      // Fallback para busca por palavras-chave
      return await getRelevantVideoContextFallback(supabase, companyId, query);
    }

    if (!chunks || chunks.length === 0) {
      return '';
    }

    // Agrupar chunks por vídeo
    const videosMap = new Map<string, {
      title: string;
      description: string | null;
      chunks: Array<{ text: string; similarity: number }>;
      maxSimilarity: number;
    }>();

    for (const chunk of chunks) {
      if (!videosMap.has(chunk.video_id)) {
        const { data: video } = await supabase
          .from('company_videos')
          .select('title, description')
          .eq('id', chunk.video_id)
          .single();

        if (video) {
          videosMap.set(chunk.video_id, {
            title: video.title,
            description: video.description,
            chunks: [],
            maxSimilarity: chunk.similarity || 0,
          });
        }
      }

      const video = videosMap.get(chunk.video_id);
      if (video) {
        video.chunks.push({
          text: chunk.chunk_text,
          similarity: chunk.similarity || 0,
        });
        if (chunk.similarity && chunk.similarity > video.maxSimilarity) {
          video.maxSimilarity = chunk.similarity;
        }
      }
    }

    // Ordenar por similaridade e pegar os top 5 vídeos
    const topVideos = Array.from(videosMap.values())
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
      .slice(0, 5);

    if (topVideos.length === 0) {
      return '';
    }

    // Formatar contexto
    let context = '\n## CONHECIMENTO DOS VÍDEOS DA EMPRESA\n\n';
    context += 'Baseado na pergunta do usuário, aqui estão transcrições relevantes de vídeos da empresa:\n\n';

    for (const video of topVideos) {
      context += `### [Vídeo: ${video.title}]\n\n`;
      
      if (video.description) {
        context += `Descrição: ${video.description}\n\n`;
      }

      context += 'Transcrição relevante:\n';
      
      // Pegar os 2-3 chunks mais relevantes de cada vídeo
      const topChunks = video.chunks
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      for (const chunk of topChunks) {
        context += `- ${chunk.text}\n`;
      }

      context += '\n';
    }

    context += 'Use essas informações para responder de forma precisa e contextualizada. ';
    context += 'Quando apropriado, mencione qual vídeo contém a informação relevante.\n\n';

    return context;
  } catch (error) {
    console.error('[Chat API] Erro ao buscar contexto de vídeos:', error);
    return '';
  }
}

/**
 * Busca alternativa usando palavras-chave quando embeddings não estão disponíveis
 */
async function getRelevantVideoContextFallback(
  supabase: any,
  companyId: string,
  query: string
): Promise<string> {
  try {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (queryWords.length === 0) {
      return '';
    }

    const searchPattern = `%${queryWords.join('%')}%`;

    const { data: videos } = await supabase
      .from('company_videos')
      .select('id, title, description, transcription_text')
      .eq('company_id', companyId)
      .eq('transcription_status', 'completed')
      .not('transcription_text', 'is', null)
      .ilike('transcription_text', searchPattern)
      .limit(5);

    if (!videos || videos.length === 0) {
      return '';
    }

    let context = '\n## CONHECIMENTO DOS VÍDEOS DA EMPRESA\n\n';
    context += 'Baseado na pergunta do usuário, aqui estão transcrições relevantes de vídeos da empresa:\n\n';

    for (const video of videos) {
      if (!video.transcription_text) continue;

      context += `### [Vídeo: ${video.title}]\n\n`;
      
      if (video.description) {
        context += `Descrição: ${video.description}\n\n`;
      }

      // Encontrar trechos relevantes
      const sentences = video.transcription_text.split(/[.!?]\s+/);
      const relevantSentences = sentences
        .filter(s => {
          const lowerS = s.toLowerCase();
          return queryWords.some(word => lowerS.includes(word));
        })
        .slice(0, 3);

      if (relevantSentences.length > 0) {
        context += 'Transcrição relevante:\n';
        for (const sentence of relevantSentences) {
          context += `- ${sentence}\n`;
        }
        context += '\n';
      }
    }

    context += 'Use essas informações para responder de forma precisa e contextualizada.\n\n';

    return context;
  } catch (error) {
    console.error('[Chat API] Erro na busca alternativa:', error);
    return '';
  }
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
    // Tentar ler a variável de ambiente
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Debug: log para verificar se a variável está sendo lida (sem expor o valor completo)
    console.log('[Chat API] Environment check:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 3) || 'N/A',
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI')).join(', ') || 'none',
    });
    
    if (!apiKey) {
      console.error('[Chat API] OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      console.error('[Chat API] Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')).join(', ') || 'none');
      return res.status(500).json({
        error: 'API key não configurada. Por favor, configure OPENAI_API_KEY nas variáveis de ambiente do servidor e faça um novo deploy.',
        hint: 'Após adicionar a variável na Vercel, é necessário fazer um novo deploy para que ela seja aplicada.',
      });
    }

    const { message, company, conversationHistory }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Buscar contexto de vídeos relevantes
    let videoContext = '';
    if (company?.id) {
      try {
        videoContext = await getRelevantVideoContext(company.id, message);
      } catch (error) {
        console.error('[Chat API] Erro ao buscar contexto de vídeos:', error);
        // Continuar sem contexto de vídeos se houver erro
      }
    }

    // Construir histórico de mensagens no formato da API
    const systemPrompt = buildSystemPrompt(company) + videoContext;
    
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Adicionar histórico da conversa (últimas 10 mensagens para não exceder tokens)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Adicionar a mensagem atual
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || `Erro na API: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || '';

    if (!assistantMessage) {
      return res.status(500).json({ error: 'Resposta vazia da API' });
    }

    return res.status(200).json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao comunicar com a IA',
    });
  }
}
