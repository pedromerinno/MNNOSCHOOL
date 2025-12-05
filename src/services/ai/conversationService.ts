import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./chatService";

export interface AIConversation {
  id: string;
  user_id: string;
  company_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationWithMessages extends AIConversation {
  messages: AIMessage[];
}

/**
 * Serviço para gerenciar conversas de IA no banco de dados
 */
export class ConversationService {
  /**
   * Cria uma nova conversa ou retorna a conversa ativa atual
   */
  async getOrCreateActiveConversation(
    userId: string,
    companyId: string
  ): Promise<AIConversation | null> {
    try {
      // Tentar encontrar uma conversa ativa recente (últimas 24 horas)
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data: existingConversations, error: findError } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .gte("updated_at", oneDayAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(1);

      // Se encontrou uma conversa ativa, retornar
      if (existingConversations && existingConversations.length > 0 && !findError) {
        return existingConversations[0];
      }

      // Se houve erro diferente de "não encontrado", logar mas continuar
      if (findError && findError.code !== 'PGRST116') {
        console.warn("Erro ao buscar conversa existente:", findError);
      }

      // Validar dados antes de inserir
      if (!userId || !companyId) {
        throw new Error("userId e companyId são obrigatórios");
      }

      // Verificar se o usuário pertence à empresa
      // Usar a função RPC se disponível, caso contrário verificar diretamente
      try {
        const { data: userCompany, error: checkError } = await supabase
          .from("user_empresa")
          .select("user_id, empresa_id")
          .eq("user_id", userId)
          .eq("empresa_id", companyId)
          .maybeSingle();

        if (checkError) {
          console.warn("Erro ao verificar associação (pode ser RLS):", checkError);
          // Continuar mesmo com erro - a política RLS vai bloquear se necessário
        } else if (!userCompany) {
          console.error("Usuário não pertence à empresa:", {
            userId,
            companyId,
          });
          throw new Error("Você não tem acesso a esta empresa. Verifique se você está associado a ela.");
        } else {
          console.log("Usuário confirmado como membro da empresa:", { userId, companyId });
        }
      } catch (error: any) {
        // Se for erro de "não encontrado", lançar mensagem específica
        if (error.message?.includes("não tem acesso") || error.message?.includes("não pertence")) {
          throw error;
        }
        // Outros erros podem ser de RLS, vamos tentar criar mesmo assim
        console.warn("Erro na verificação prévia, tentando criar conversa (RLS vai validar):", error);
      }

      // Criar nova conversa se não existir uma ativa
      console.log("Criando nova conversa:", { userId, companyId });
      
      const { data: newConversation, error: createError } = await supabase
        .from("ai_conversations")
        .insert([
          {
            user_id: userId,
            company_id: companyId,
            title: null,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Erro ao criar conversa:", {
          error: createError,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code,
          userId,
          companyId,
        });
        
        // Mensagens de erro mais específicas
        if (createError.code === '42501' || createError.message?.includes('row-level security') || createError.message?.includes('RLS')) {
          throw new Error("Erro de permissão: Você não tem acesso a esta empresa ou as políticas de segurança estão bloqueando a operação. Verifique se você está associado à empresa.");
        }
        
        if (createError.code === '23503' || createError.message?.includes('foreign key') || createError.message?.includes('violates foreign key')) {
          throw new Error("Erro: Empresa ou usuário inválido. Verifique se a empresa existe e se você está logado corretamente.");
        }
        
        if (createError.message) {
          throw new Error(`Erro ao criar conversa: ${createError.message}`);
        }
        
        throw new Error("Erro desconhecido ao criar conversa. Tente novamente.");
      }

      console.log("Conversa criada com sucesso:", newConversation?.id);
      return newConversation;
    } catch (error: any) {
      console.error("Erro ao obter/criar conversa:", {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        userId,
        companyId,
      });
      return null;
    }
  }

  /**
   * Salva uma mensagem na conversa
   */
  async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<AIMessage | null> {
    try {
      const { data: message, error } = await supabase
        .from("ai_messages")
        .insert([
          {
            conversation_id: conversationId,
            role,
            content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return message;
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
      return null;
    }
  }

  /**
   * Salva múltiplas mensagens de uma vez
   */
  async saveMessages(
    conversationId: string,
    messages: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<AIMessage[]> {
    try {
      const messagesToInsert = messages.map((msg) => ({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
      }));

      const { data: savedMessages, error } = await supabase
        .from("ai_messages")
        .insert(messagesToInsert)
        .select();

      if (error) throw error;

      return savedMessages || [];
    } catch (error) {
      console.error("Erro ao salvar mensagens:", error);
      return [];
    }
  }

  /**
   * Carrega uma conversa com todas as mensagens
   */
  async loadConversation(
    conversationId: string
  ): Promise<ConversationWithMessages | null> {
    try {
      const { data: conversation, error: convError } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (convError) throw convError;

      const { data: messages, error: messagesError } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      return {
        ...conversation,
        messages: messages || [],
      };
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
      return null;
    }
  }

  /**
   * Lista todas as conversas do usuário para uma empresa
   */
  async listConversations(
    userId: string,
    companyId: string
  ): Promise<AIConversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return conversations || [];
    } catch (error) {
      console.error("Erro ao listar conversas:", error);
      return [];
    }
  }

  /**
   * Atualiza o título da conversa
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .update({ title })
        .eq("id", conversationId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Erro ao atualizar título da conversa:", error);
      return false;
    }
  }

  /**
   * Deleta uma conversa e todas as suas mensagens
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
      return false;
    }
  }

  /**
   * Converte mensagens do banco para o formato ChatMessage
   */
  convertToChatMessages(messages: AIMessage[]): ChatMessage[] {
    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));
  }
}

// Instância singleton do serviço
export const conversationService = new ConversationService();
