
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
  const [displayCompany, setDisplayCompany] = useState<Company | null>(selectedCompany);
  const [isVisible, setIsVisible] = useState(false);

  // Simplificar atualização da empresa
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== displayCompany?.id) {
      setDisplayCompany(selectedCompany);
    }
  }, [selectedCompany?.id]);

  // Trigger animation on mount - mais rápido
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/integration');
  };

  const defaultPhrase = "Construindo um futuro melhor para empresas e colaboradores";
  const companyPhrase = displayCompany?.frase_institucional || defaultPhrase;

  return (
    <div className={`mb-16 mt-10 transition-all duration-500 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="flex flex-col items-center">
        <p 
          className={`text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-[#333333] py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold transition-all duration-500 ease-out delay-75 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Olá, {userName}
        </p>
        
        <p 
          className={`text-foreground text-center text-[24px] md:text-[40px] font-normal max-w-[90%] md:max-w-[50%] leading-[1.1] mb-5 transition-all duration-500 ease-out delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {companyPhrase}
        </p>
        
        <Button 
          onClick={handleLearnMore} 
          className={`mt-1 flex items-center gap-2 text-white dark:text-black rounded-full text-sm transition-all duration-500 ease-out delay-225 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
          variant="default"
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
