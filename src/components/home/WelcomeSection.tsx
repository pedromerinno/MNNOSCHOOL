
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [displayCompany, setDisplayCompany] = useState<Company | null>(null);

  // Atualizar empresa exibida quando a seleção mudar
  useEffect(() => {
    if (selectedCompany) {
      console.log('[WelcomeSection] Empresa selecionada atualizada:', selectedCompany.nome);
      setDisplayCompany(selectedCompany);
    }
  }, [selectedCompany]);

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/integration');
  };

  const defaultPhrase = "Juntos, estamos desenhando o futuro de grandes empresas";
  const companyPhrase = displayCompany?.frase_institucional || defaultPhrase;

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Olá, {userName}
        </p>
        
        <p 
          className="text-foreground text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
        >
          {companyPhrase}
        </p>
        
        <Button 
          onClick={handleLearnMore} 
          className="mt-1 flex items-center gap-2 text-white dark:text-black rounded-full text-sm transition-colors duration-300 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90"
          variant="default"
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
