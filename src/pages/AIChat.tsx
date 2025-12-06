import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, Loader2, Bot, Plus, Mic, ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAIChat } from "@/hooks/useAIChat";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Preloader } from "@/components/ui/Preloader";
import { AIChatLayout } from "@/components/ui/ai-chat-layout";
import { useAnimatedText } from "@/components/ui/animated-text";
import { Typewriter } from "@/components/ui/typewriter-text";

// Componente de ondas sonoras para o botão de voz
const VoiceWaves = () => (
  <svg
    className="w-4 h-4 text-white dark:text-black"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="2" y="10" width="2" height="4" rx="1" />
    <rect x="6" y="8" width="2" height="8" rx="1" />
    <rect x="10" y="6" width="2" height="12" rx="1" />
    <rect x="14" y="8" width="2" height="8" rx="1" />
    <rect x="18" y="10" width="2" height="4" rx="1" />
  </svg>
);

// Componente de animação de 3 pontos
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-1">
    <span 
      className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" 
      style={{ animationDelay: '0ms', animationDuration: '1.4s' }} 
    />
    <span 
      className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" 
      style={{ animationDelay: '200ms', animationDuration: '1.4s' }} 
    />
    <span 
      className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" 
      style={{ animationDelay: '400ms', animationDuration: '1.4s' }} 
    />
  </div>
);

// Função para processar markdown básico e converter para JSX
const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let key = 0;

  // Processar linha por linha para manter quebras de linha
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={key++} />);
    }

    if (!line) {
      return;
    }

    // Processar markdown na linha de forma sequencial
    let remaining = line;
    let currentPos = 0;

    // Encontrar todos os padrões markdown
    const matches: Array<{ start: number; end: number; type: string; content: string; url?: string }> = [];
    
    // Links primeiro (mais específico)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(line)) !== null) {
      matches.push({
        start: linkMatch.index,
        end: linkMatch.index + linkMatch[0].length,
        type: 'link',
        content: linkMatch[1],
        url: linkMatch[2],
      });
    }

    // Bold (**texto**)
    const boldRegex = /\*\*([^*]+?)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(line)) !== null) {
      // Verificar se não está dentro de um link
      const isInLink = matches.some(m => 
        m.type === 'link' && boldMatch.index >= m.start && boldMatch.index < m.end
      );
      if (!isInLink) {
        matches.push({
          start: boldMatch.index,
          end: boldMatch.index + boldMatch[0].length,
          type: 'bold',
          content: boldMatch[1],
        });
      }
    }

    // Code (`texto`)
    const codeRegex = /`([^`]+?)`/g;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(line)) !== null) {
      const isInOther = matches.some(m => 
        codeMatch.index >= m.start && codeMatch.index < m.end
      );
      if (!isInOther) {
        matches.push({
          start: codeMatch.index,
          end: codeMatch.index + codeMatch[0].length,
          type: 'code',
          content: codeMatch[1],
        });
      }
    }

    // Italic (*texto*) - mas não **texto**
    const italicRegex = /(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(line)) !== null) {
      const isInOther = matches.some(m => 
        italicMatch.index >= m.start && italicMatch.index < m.end
      );
      if (!isInOther) {
        matches.push({
          start: italicMatch.index,
          end: italicMatch.index + italicMatch[0].length,
          type: 'italic',
          content: italicMatch[1],
        });
      }
    }

    // Ordenar matches por posição
    matches.sort((a, b) => a.start - b.start);

    // Construir elementos JSX
    matches.forEach((match) => {
      // Texto antes do match
      if (match.start > currentPos) {
        const beforeText = line.slice(currentPos, match.start);
        if (beforeText) {
          parts.push(<span key={key++}>{beforeText}</span>);
        }
      }

      // Elemento markdown
      switch (match.type) {
        case 'bold':
          parts.push(<strong key={key++}>{match.content}</strong>);
          break;
        case 'italic':
          parts.push(<em key={key++}>{match.content}</em>);
          break;
        case 'code':
          parts.push(
            <code key={key++} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">
              {match.content}
            </code>
          );
          break;
        case 'link':
          parts.push(
            <a
              key={key++}
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {match.content}
            </a>
          );
          break;
      }

      currentPos = match.end;
    });

    // Texto restante
    if (currentPos < line.length) {
      const remaining = line.slice(currentPos);
      if (remaining) {
        parts.push(<span key={key++}>{remaining}</span>);
      }
    }
  });

  return parts.length > 0 ? parts : [text];
};

// Componente para animar mensagens da IA usando useAnimatedText
const AnimatedMessageText = ({ 
  text, 
  messageId,
  onTextUpdate 
}: { 
  text: string; 
  messageId: string;
  onTextUpdate?: () => void;
}) => {
  const animatedText = useAnimatedText(text, "");
  const prevTextRef = useRef(text);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rolar durante a animação
  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
    }

    // Rolar a cada atualização do texto animado
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (onTextUpdate) {
        onTextUpdate();
      }
    }, 50);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [animatedText, onTextUpdate, text]);

  return <span>{parseMarkdown(animatedText)}</span>;
};

const AIChatContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCompany, isLoading: isLoadingCompany } = useCompanies();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const initialMessage = (location.state as { message?: string })?.message;

  const { messages, isLoading, sendMessage, clearChat } = useAIChat(selectedCompany);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const timeoutRefsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const previousMessagesLengthRef = useRef(0);
  const previousCompanyIdRef = useRef<string | null>(null);
  const userMessageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Função para rolar até o final da última mensagem
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    // Verificar se o componente está montado
    if (!isMountedRef.current) {
      return;
    }

    // Usar requestAnimationFrame para garantir que o DOM está pronto
    requestAnimationFrame(() => {
      if (!isMountedRef.current) {
        return;
      }

      // Verificar se as refs ainda existem e estão montadas
      const container = messagesContainerRef.current;
      const endElement = messagesEndRef.current;

      if (!container || !endElement) {
        return;
      }

      try {
        // Verificar se o container ainda está no DOM
        if (!container.isConnected || !endElement.isConnected) {
          return;
        }

        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        if (scrollHeight > clientHeight) {
          container.scrollTo({
            top: scrollHeight,
            behavior,
          });
        }
      } catch (error) {
        // Ignorar erros de scroll silenciosamente
        console.debug("Scroll error (ignored):", error);
      }
    });
  }, []);

  // Função para rolar até a mensagem do usuário (logo abaixo do blur top)
  const scrollToUserMessage = useCallback((messageId: string, behavior: ScrollBehavior = "smooth") => {
    if (!isMountedRef.current) {
      return;
    }

    // Usar múltiplos requestAnimationFrame para garantir que o DOM foi totalmente atualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isMountedRef.current) {
          return;
        }

        const container = messagesContainerRef.current;
        const messageElement = userMessageRefs.current.get(messageId);

        if (!container || !messageElement) {
          // Se o elemento ainda não existe, tentar novamente após um delay
          setTimeout(() => {
            if (isMountedRef.current) {
              const retryElement = userMessageRefs.current.get(messageId);
              if (retryElement && container) {
                scrollToUserMessage(messageId, behavior);
              }
            }
          }, 100);
          return;
        }

        try {
          if (!container.isConnected || !messageElement.isConnected) {
            return;
          }

          // Calcular a posição: blur top (80px) + um pouco de espaço (20px) = 100px do topo
          const blurTopHeight = 80;
          const spacing = 20;
          const targetOffset = blurTopHeight + spacing;

          // Usar getBoundingClientRect para obter posições absolutas
          const containerRect = container.getBoundingClientRect();
          const messageRect = messageElement.getBoundingClientRect();
          
          // Calcular a posição da mensagem relativa ao topo do container (incluindo padding)
          // A diferença entre as posições absolutas nos dá a posição relativa
          const messageTopRelativeToViewport = messageRect.top;
          const containerTopRelativeToViewport = containerRect.top;
          
          // A posição da mensagem dentro do container (considerando scroll atual)
          const messageTopInContainer = messageTopRelativeToViewport - containerTopRelativeToViewport + container.scrollTop;
          
          // Rolar para posicionar a mensagem no targetOffset
          const targetScroll = messageTopInContainer - targetOffset;

          container.scrollTo({
            top: Math.max(0, targetScroll),
            behavior,
          });
        } catch (error) {
          console.debug("Scroll to user message error (ignored):", error);
        }
      });
    });
  }, []);

  // Verificar se o componente está montado
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Limpar todos os timeouts pendentes
      timeoutRefsRef.current.forEach(timeout => {
        try {
          clearTimeout(timeout);
        } catch (error) {
          // Ignorar erros
        }
      });
      timeoutRefsRef.current.clear();
    };
  }, []);

  // Detectar mudanças na empresa selecionada e limpar o chat
  useEffect(() => {
    const currentCompanyId = selectedCompany?.id || null;
    
    // Se a empresa mudou (e não é a primeira vez)
    if (previousCompanyIdRef.current !== null && previousCompanyIdRef.current !== currentCompanyId) {
      clearChat();
      hasInitializedRef.current = false;
    }
    
    // Atualizar a referência
    previousCompanyIdRef.current = currentCompanyId;
  }, [selectedCompany?.id, clearChat]);

  useEffect(() => {
    if (!user?.id || !selectedCompany?.id) {
      return;
    }

    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    const initializeChat = async () => {
      if (!isMountedRef.current) return;
      
      clearChat();
      
      if (initialMessage && initialMessage.trim()) {
        setTimeout(() => {
          if (isMountedRef.current && user?.id && selectedCompany?.id) {
            sendMessage(initialMessage.trim());
          }
        }, 200);
      }
    };

    initializeChat();
  }, [clearChat, initialMessage, sendMessage, user?.id, selectedCompany?.id]);


  // Detectar quando uma nova mensagem do usuário é adicionada e fazer scroll
  useEffect(() => {
    if (messages.length === 0 || !isMountedRef.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const previousLength = previousMessagesLengthRef.current;
    
    // Se a última mensagem é do usuário e é nova (comparando com o comprimento anterior)
    if (lastMessage && lastMessage.role === "user" && messages.length > previousLength) {
      // Atualizar o comprimento anterior imediatamente
      previousMessagesLengthRef.current = messages.length;
      
      // Aguardar múltiplos frames e verificar se a ref existe antes de fazer scroll
      const rafId1 = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          const rafId3 = requestAnimationFrame(() => {
            if (!isMountedRef.current) return;
            
            // Verificar se a ref da mensagem já existe
            const messageElement = userMessageRefs.current.get(lastMessage.id);
            if (!messageElement) {
              // Se ainda não existe, tentar novamente após um delay maior
              const retryTimeout = setTimeout(() => {
                if (isMountedRef.current) {
                  const retryElement = userMessageRefs.current.get(lastMessage.id);
                  if (retryElement) {
                    scrollToUserMessage(lastMessage.id);
                  }
                }
                timeoutRefsRef.current.delete(retryTimeout);
              }, 200);
              timeoutRefsRef.current.add(retryTimeout);
              return;
            }
            
            const timeout = setTimeout(() => {
              if (isMountedRef.current) {
                try {
                  scrollToUserMessage(lastMessage.id);
                } catch (error) {
                  // Ignorar erros
                }
              }
              timeoutRefsRef.current.delete(timeout);
            }, 50);
            
            timeoutRefsRef.current.add(timeout);
          });
          
          return () => {
            cancelAnimationFrame(rafId3);
          };
        });
        
        return () => {
          cancelAnimationFrame(rafId2);
        };
      });

      return () => {
        cancelAnimationFrame(rafId1);
      };
    }
    
    // Atualizar o comprimento anterior para outras mudanças
    if (messages.length !== previousLength) {
      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages, scrollToUserMessage]);

  // Rolar quando mensagens mudam (apenas para mensagens da IA)
  useEffect(() => {
    if (messages.length === 0 || !isMountedRef.current) return;
    
    // Verificar se a última mensagem é do usuário
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      // Se for mensagem do usuário, não fazer scroll automático aqui
      return;
    }
    
    // Usar requestAnimationFrame para garantir que o DOM foi atualizado
    const rafId = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          try {
            scrollToBottom("smooth");
          } catch (error) {
            // Ignorar erros
          }
        }
        timeoutRefsRef.current.delete(timeout);
      }, 50);
      
      timeoutRefsRef.current.add(timeout);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [messages, scrollToBottom]);

  // Rolar quando o loading termina (nova resposta da IA)
  useEffect(() => {
    if (!isLoading && messages.length > 0 && isMountedRef.current) {
      const rafId = requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        
        const timeout = setTimeout(() => {
          if (isMountedRef.current) {
            try {
              scrollToBottom("smooth");
            } catch (error) {
              // Ignorar erros
            }
          }
          timeoutRefsRef.current.delete(timeout);
        }, 100);
        
        timeoutRefsRef.current.add(timeout);
      });

      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [isLoading, messages.length, scrollToBottom]);


  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (!user?.id) {
      toast.error("Por favor, faça login para usar o assistente de IA");
      return;
    }
    
    if (!selectedCompany?.id) {
      toast.error("Por favor, selecione uma empresa para usar o assistente de IA");
      return;
    }

    const message = inputValue.trim();
    setInputValue("");
    setIsInputActive(false);
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  // Sidebar content with back button
  const sidebarContent = (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full text-left group"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voltar</span>
        </button>
      </div>
    </div>
  );

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <AIChatLayout
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Chat IA" },
      ]}
      sidebarContent={sidebarContent}
      companyName={selectedCompany?.nome}
      companyLogo={selectedCompany?.logo}
      companyColor={companyColor}
      chatContent={
        <div className="flex flex-col h-full min-w-0 relative overflow-hidden bg-[#F8F7F4] dark:bg-[#191919]">
          {/* Container para área de mensagens com blurs */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
          
          {/* Blur Top - Fixo, não rola (z-index alto) */}
          <ProgressiveBlur 
            position="top" 
            backgroundColor="rgb(248, 247, 244)"
            height="80px"
            blurAmount="20px"
            className="dark:hidden"
          />
          <ProgressiveBlur 
            position="top" 
            backgroundColor="rgb(25, 25, 25)"
            height="80px"
            blurAmount="20px"
            className="hidden dark:block"
          />
          
          {/* Área de mensagens - Rola por baixo dos blurs (z-index mais baixo) */}
          <div 
            ref={messagesContainerRef}
            className="absolute inset-0 overflow-y-auto px-4 scroll-smooth overscroll-contain z-10"
            style={{ 
              paddingTop: '80px',
              paddingBottom: '250px'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full max-w-5xl mx-auto">
                <Typewriter
                  text="Por onde começamos?"
                  speed={100}
                  loop={true}
                  delay={2000}
                  className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto py-6 space-y-4" key="messages-container">
                {messages.map((message, index) => {
                  const previousMessage = index > 0 ? messages[index - 1] : null;
                  const isDifferentRole = previousMessage && previousMessage.role !== message.role;
                  const isUserMessage = message.role === "user";
                  
                  if (isUserMessage) {
                    return (
                      <motion.div
                        key={`user-message-${message.id}`}
                        ref={(el) => {
                          if (el) {
                            userMessageRefs.current.set(message.id, el);
                          } else {
                            userMessageRefs.current.delete(message.id);
                          }
                        }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className={cn(
                          "flex gap-3 animate-slide-up",
                          "justify-end",
                          isDifferentRole && "mt-6"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3",
                            "bg-black dark:bg-white text-white dark:text-black max-w-[70%]"
                          )}
                        >
                          <p className="text-base whitespace-pre-wrap break-words">
                            {parseMarkdown(message.content)}
                          </p>
                        </div>
                        {user && (
                          <Avatar key={`avatar-user-${message.id}`} className="flex-shrink-0 w-8 h-8">
                            <AvatarImage 
                              src={getAvatarUrl(userProfile?.avatar) || undefined} 
                              alt={userProfile?.display_name || user.email || "User"}
                              onError={(e) => {
                                try {
                                  const target = e.target as HTMLImageElement;
                                  if (target && target.parentElement) {
                                    target.src = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
                                  }
                                } catch (error) {
                                  // Ignorar erros
                                }
                              }}
                            />
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                              {getInitials(userProfile?.display_name || user.email || "U")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    );
                  }
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        "justify-start",
                        isDifferentRole && "mt-6"
                      )}
                    >
                      {selectedCompany && (
                        <Avatar key={`avatar-assistant-${message.id}`} className="flex-shrink-0 w-8 h-8">
                          <AvatarImage 
                            src={selectedCompany.logo || undefined} 
                            alt={selectedCompany.nome || "IA"} 
                          />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                            {selectedCompany.nome ? getInitials(selectedCompany.nome) : <Bot size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-[600px]"
                        )}
                      >
                        <p className="text-base whitespace-pre-wrap break-words">
                          <AnimatedMessageText
                            text={message.content}
                            messageId={message.id}
                            onTextUpdate={scrollToBottom}
                          />
                        </p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="flex-shrink-0 w-8 h-8">
                      <AvatarImage 
                        src={selectedCompany?.logo} 
                        alt={selectedCompany?.nome || "IA"} 
                      />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                        {selectedCompany?.nome ? getInitials(selectedCompany.nome) : <Bot size={16} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Blur Bottom - Fixo no bottom: 0, não rola (z-index alto) */}
          <ProgressiveBlur 
            position="bottom" 
            backgroundColor="rgb(248, 247, 244)"
            height="200px"
            blurAmount="20px"
            className="dark:hidden"
          />
          <ProgressiveBlur 
            position="bottom" 
            backgroundColor="rgb(25, 25, 25)"
            height="200px"
            blurAmount="20px"
            className="hidden dark:block"
          />
          </div>

          {/* Input Bar - Flutuante no bottom */}
          <div className="absolute z-50 flex items-center justify-center px-6 pointer-events-none" style={{ left: '0', right: '0', bottom: '120px' }}>
            <div className="w-full max-w-2xl pointer-events-auto">
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full bg-[#F8F7F4] dark:bg-[#191919] shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm bg-[#F8F7F4]/95 dark:bg-[#191919]/95">
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                  title="Anexar"
                  type="button"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsInputActive(true)}
                  onBlur={() => {
                    if (!inputValue) setIsInputActive(false);
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-0 outline-0 bg-transparent text-base font-normal text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Pergunte alguma coisa"
                />

                <div className="flex items-center gap-2">
                  <button
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                    title="Entrada de voz"
                    type="button"
                  >
                    <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  {inputValue.trim() ? (
                    <button
                      className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Enviar"
                      type="button"
                      onClick={handleSend}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
                      ) : (
                        <Send className="w-4 h-4 text-white dark:text-black" />
                      )}
                    </button>
                  ) : (
                    <button
                      className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                      title="Gravar voz"
                      type="button"
                    >
                      <VoiceWaves />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

const AIChat = () => {
  const { selectedCompany, isLoading: isLoadingCompany } = useCompanies();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user?.id || !selectedCompany?.id) {
      setIsLoadingData(true);
      return;
    }

    // Simular um breve carregamento inicial
    const timer = setTimeout(() => {
      setIsLoadingData(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user?.id, selectedCompany?.id]);

  // Mostrar preloader durante carregamento inicial
  const showPreloader = authLoading || !user || !userProfile || isLoadingData || (!selectedCompany && isLoadingCompany);

  if (showPreloader) {
    return <Preloader />;
  }

  if (!user) {
    return <Preloader />;
  }

  return (
    <>
      <MainNavigationMenu />
      <div className="w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <AIChatContent />
      </div>
    </>
  );
};

export default AIChat;
