
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { selectedCompany } = useCompanyContext();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar cache para renderização inicial
  const [displayCompany, setDisplayCompany] = useState<Company | null>(() => {
    // Tentar obter a empresa do cache imediatamente
    const cachedCompany = getInitialSelectedCompany();
    if (cachedCompany) {
      console.log('Usando empresa em cache para exibição inicial:', cachedCompany.nome);
      return cachedCompany;
    }
    return null;
  });
  
  // Inicializar cor do botão com o valor em cache se disponível 
  const [buttonColor, setButtonColor] = useState<string>(() => {
    const cachedCompany = getInitialSelectedCompany();
    return cachedCompany?.cor_principal || '#000000';
  });
  
  // Atualizar empresa exibida quando a seleção mudar
  useEffect(() => {
    if (selectedCompany) {
      setDisplayCompany(selectedCompany);
      // Atualizar cor do botão apenas quando a empresa mudar
      setButtonColor(selectedCompany.cor_principal || '#000000');
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
          className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
        >
          {companyPhrase}
        </p>
        
        <Button 
          onClick={handleLearnMore} 
          className="mt-1 flex items-center gap-2 text-white rounded-full text-sm transition-colors duration-300"
          variant="default"
          style={{ 
            backgroundColor: buttonColor 
          }}
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
