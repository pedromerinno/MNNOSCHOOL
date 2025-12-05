import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Company } from "@/types/company";
import { cn } from "@/lib/utils";

interface AIChatProps {
  company: Company | null;
  className?: string;
}

export const AIChat = ({ company, className }: AIChatProps) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!inputValue) setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  const handleActivate = () => setIsActive(true);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue("");
    setIsActive(false);
    
    // Redirecionar para a página de IA com a mensagem
    navigate("/ai-chat", { 
      state: { message } 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerVariants = {
    collapsed: {
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      width: "100%",
      maxWidth: "768px",
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <div className={cn("w-full flex justify-center items-center", className)}>
      <motion.div
        ref={wrapperRef}
        className="bg-white dark:bg-[#1a1a1a] h-[68px]"
        variants={containerVariants}
        animate={isActive || inputValue ? "expanded" : "collapsed"}
        initial="collapsed"
        style={{ overflow: "hidden", borderRadius: 32 }}
        onClick={handleActivate}
      >
        <div className="flex flex-col items-stretch w-full h-full">
          {/* Input Row */}
          <div className="flex items-center gap-2 p-3 rounded-full bg-white dark:bg-[#1a1a1a] w-full">
            <button
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
              title="Anexar arquivo"
              type="button"
              tabIndex={-1}
            >
              <Paperclip size={20} />
            </button>

            {/* Text Input & Placeholder */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                style={{ position: "relative", zIndex: 1 }}
                onFocus={handleActivate}
                onKeyPress={handleKeyPress}
                placeholder={isActive || inputValue ? "" : "Faça uma pergunta"}
              />
            </div>

            <button
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
              title="Entrada de voz"
              type="button"
              tabIndex={-1}
            >
              <Mic size={20} />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="flex items-center gap-1 bg-black dark:bg-white hover:bg-zinc-700 dark:hover:bg-gray-200 text-white dark:text-black p-3 rounded-full font-medium justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enviar"
              type="button"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

