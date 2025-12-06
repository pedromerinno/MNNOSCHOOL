import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useFocus } from "@/contexts/FocusContext";
import { cn } from "@/lib/utils";

export const FocusTimer = () => {
  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  const { isVisible, isRunning, isPaused, openFocus, remainingSeconds } = useFocus();
  
  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      const cachedCompany = getInitialSelectedCompany();
      return cachedCompany?.cor_principal || "#1EAEDB";
    } catch (e) {
      return "#1EAEDB";
    }
  });

  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setAccentColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);

  const handleClick = () => {
    // Se não está visível, abrir com tempo padrão de 25 minutos
    if (!isVisible) {
      openFocus(25 * 60);
    }
    // Se já está visível, o popup global já está mostrando
    // O usuário pode interagir diretamente com o popup
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "text-gray-500 dark:text-gray-300 hover:text-current dark:hover:text-current transition-colors relative",
        isRunning && !isPaused && "animate-pulse"
      )}
      style={
        {
          "--hover-color": accentColor,
          ...(isRunning && !isPaused
            ? { color: accentColor }
            : {}),
        } as React.CSSProperties
      }
      onClick={handleClick}
      title={isVisible ? "Foco ativo" : "Abrir modo foco"}
    >
      <Timer className="h-5 w-5" />
      {isRunning && !isPaused && (
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
      )}
    </Button>
  );
};
