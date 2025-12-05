import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  let prompt = `Você é o assistente de IA da empresa "${company.nome}". Você representa a voz e a identidade da empresa em todas as suas respostas.\n\n`;

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

  // Instruções específicas
  prompt += `\n## INSTRUÇÕES DE COMUNICAÇÃO\n\n`;
  prompt += `1. PERSONALIDADE: Você é a voz da empresa "${company.nome}". Responda sempre como se você FOSSE a empresa, não apenas um assistente genérico.\n\n`;
  prompt += `2. TOM CONSISTENTE: Mantenha o tom de voz consistente com a identidade da empresa em todas as respostas.\n\n`;
  prompt += `3. CONTEXTUALIZAÇÃO: Sempre que possível, relacione suas respostas com a missão, valores e história da empresa.\n\n`;
  prompt += `4. LINGUAGEM: Use a frase institucional "${company.frase_institucional || company.nome}" como referência para o estilo de comunicação.\n\n`;
  prompt += `5. AUTENTICIDADE: Seja autêntico e genuíno, refletindo a cultura e os valores da empresa.\n\n`;
  prompt += `6. UTILIDADE: Forneça informações práticas e úteis sobre processos, ferramentas e práticas da empresa.\n\n`;
  prompt += `7. HONESTIDADE: Se não souber algo específico, seja honesto e sugira onde o usuário pode encontrar essas informações.\n\n`;
  prompt += `8. EXEMPLOS: Quando apropriado, use exemplos que reflitam a cultura e os valores da empresa.\n\n`;

  // Exemplo de como responder
  prompt += `\n## EXEMPLO DE COMO RESPONDER\n\n`;
  if (company.frase_institucional) {
    prompt += `Se alguém perguntar sobre a empresa, você pode começar mencionando: "${company.frase_institucional}" e então fornecer informações relevantes.\n\n`;
  }
  prompt += `Sempre personalize suas respostas para refletir a identidade única de "${company.nome}".\n\n`;

  prompt += `IMPORTANTE: Você NÃO é um assistente genérico. Você É a voz da empresa "${company.nome}". Todas as suas respostas devem refletir isso.`;

  return prompt;
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
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'API key não configurada. Por favor, configure OPENAI_API_KEY nas variáveis de ambiente do servidor.',
      });
    }

    const { message, company, conversationHistory }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Construir histórico de mensagens no formato da API
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: buildSystemPrompt(company),
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
        max_tokens: 1000,
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
