import { Company } from "@/types/company";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

/**
 * Serviço para comunicação com a API do OpenAI ChatGPT
 * Agora usa uma API route segura no backend para proteger a chave da OpenAI
 */
export class ChatService {
  private apiUrl = "/api/chat";

  constructor() {
    // Não precisa mais de API key no front-end
  }

  /**
   * Analisa os valores da empresa para determinar o tom de comunicação
   * @deprecated Esta função agora é executada no backend. Mantida apenas para compatibilidade.
   */
  private analyzeCommunicationTone(company: Company): {
    formality: 'formal' | 'casual' | 'balanced';
    energy: 'high' | 'moderate' | 'calm';
    focus: string[];
  } {
    const allText = [
      company.missao,
      company.historia,
      company.frase_institucional,
      company.valores,
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
   * @deprecated Esta função agora é executada no backend. Mantida apenas para compatibilidade.
   */
  private buildSystemPrompt(company: Company | null): string {
    if (!company) {
      return `Você é um assistente de IA especializado em ajudar usuários com dúvidas sobre empresas e processos de trabalho. 
      Responda de forma clara, objetiva e útil. Se não souber algo, seja honesto sobre isso.`;
    }

    // Analisar tom de comunicação
    const tone = this.analyzeCommunicationTone(company);

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

  /**
   * Envia uma mensagem para o ChatGPT através da API route segura
   * A chave da OpenAI fica protegida no servidor
   */
  async sendMessage(
    message: string,
    company: Company | null,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // Preparar dados da empresa para enviar ao backend
      const companyData = company ? {
        id: company.id,
        nome: company.nome,
        missao: company.missao,
        historia: company.historia,
        frase_institucional: company.frase_institucional,
        valores: company.valores,
      } : null;

      // Preparar histórico no formato esperado
      const history = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          company: companyData,
          conversationHistory: history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro na API: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.message) {
        throw new Error("Resposta vazia da API");
      }

      return {
        message: data.message,
      };
    } catch (error) {
      console.error("Erro ao enviar mensagem para ChatGPT:", error);
      return {
        message: "",
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao comunicar com a IA",
      };
    }
  }
}

// Instância singleton do serviço
export const chatService = new ChatService();

