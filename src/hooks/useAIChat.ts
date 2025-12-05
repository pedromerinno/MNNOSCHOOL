import { useState, useCallback, useRef, useEffect } from "react";
import { chatService, ChatMessage } from "@/services/ai/chatService";
import { conversationService } from "@/services/ai/conversationService";
import { Company } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  error: string | null;
  conversationId: string | null;
  loadConversation: (conversationId: string) => Promise<void>;
}

/**
 * Hook para gerenciar o estado e lógica do chat com IA
 */
export const useAIChat = (company: Company | null): UseAIChatReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;
      
      // Verificar se usuário está disponível
      if (!user?.id) {
        toast.error("Por favor, faça login para usar o assistente de IA");
        return;
      }
      
      // Verificar se empresa está disponível
      if (!company?.id) {
        toast.error("Por favor, selecione uma empresa para usar o assistente de IA");
        return;
      }

      // Obter ou criar conversa ativa
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        try {
          const conversation = await conversationService.getOrCreateActiveConversation(
            user.id,
            company.id
          );
          if (conversation) {
            activeConversationId = conversation.id;
            setConversationId(conversation.id);
          } else {
            toast.error("Erro ao criar conversa. Verifique suas permissões ou tente novamente.");
            return;
          }
        } catch (error: any) {
          console.error("Erro ao obter/criar conversa:", error);
          const errorMessage = error?.message || "Erro desconhecido ao criar conversa";
          
          // Log detalhado para diagnóstico
          console.error("Detalhes do erro:", {
            message: errorMessage,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
            userId: user.id,
            companyId: company.id,
          });
          
          // Mensagens de erro mais específicas
          if (errorMessage.includes("não tem acesso") || errorMessage.includes("não pertence")) {
            toast.error(errorMessage);
          } else if (errorMessage.includes("row-level security") || errorMessage.includes("RLS") || errorMessage.includes("permissão")) {
            toast.error("Erro de permissão. Verifique se você tem acesso a esta empresa. Se o problema persistir, contate o administrador.");
          } else if (errorMessage.includes("foreign key") || errorMessage.includes("violates foreign key")) {
            toast.error("Erro: Empresa ou usuário inválido. Tente fazer logout e login novamente.");
          } else {
            toast.error(`Erro ao criar conversa: ${errorMessage}`);
          }
          return;
        }
      }

      // Criar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      };

      // Adicionar mensagem do usuário imediatamente e obter histórico atualizado
      let currentHistory: ChatMessage[] = [];
      setMessages((prev) => {
        currentHistory = prev; // Histórico antes de adicionar a nova mensagem
        return [...prev, userMessage];
      });
      
      // Salvar mensagem do usuário no banco
      await conversationService.saveMessage(
        activeConversationId,
        "user",
        message.trim()
      );
      
      setIsLoading(true);
      setError(null);

      try {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Enviar para a API com o histórico correto
        const response = await chatService.sendMessage(
          message.trim(),
          company,
          currentHistory
        );

        if (response.error) {
          throw new Error(response.error);
        }

        // Criar mensagem da assistente
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };

        // Adicionar resposta da assistente
        setMessages((prev) => [...prev, assistantMessage]);

        // Salvar mensagem da assistente no banco
        await conversationService.saveMessage(
          activeConversationId,
          "assistant",
          response.message
        );

        // Atualizar título da conversa se for a primeira mensagem
        if (currentHistory.length === 0) {
          const title = message.trim().slice(0, 50);
          await conversationService.updateConversationTitle(
            activeConversationId,
            title
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao processar mensagem";
        setError(errorMessage);
        
        // Remover mensagem do usuário em caso de erro
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [company, isLoading, user, conversationId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setConversationId(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const loadConversation = useCallback(
    async (convId: string) => {
      if (!convId) return;

      setIsLoading(true);
      setError(null);

      try {
        const conversation = await conversationService.loadConversation(convId);
        
        if (conversation) {
          setConversationId(conversation.id);
          const chatMessages = conversationService.convertToChatMessages(
            conversation.messages
          );
          setMessages(chatMessages);
        } else {
          throw new Error("Conversa não encontrada");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar conversa";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    error,
    conversationId,
    loadConversation,
  };
};

