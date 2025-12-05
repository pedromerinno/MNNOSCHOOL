
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { AIChat } from "@/components/ui/ai-chat";
import { Company } from "@/types/company";

interface WelcomeSectionProps {
  hasNoCompanies?: boolean;
}

export const WelcomeSection = ({ hasNoCompanies = false }: WelcomeSectionProps) => {
  const { user, userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(selectedCompany);
  const [isVisible, setIsVisible] = useState(false);

  // Simplificar atualização da empresa
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== displayCompany?.id) {
      setDisplayCompany(selectedCompany);
    }
  }, [selectedCompany?.id]);

  // Trigger animation on mount - sem delay para melhor percepção de velocidade
  useEffect(() => {
    // Usar requestAnimationFrame para animação imediata no próximo frame
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'Usuário';

  const defaultPhrase = "Construindo um futuro melhor para empresas e colaboradores";
  const companyPhrase = displayCompany?.frase_institucional || defaultPhrase;

  return (
    <div className={`mb-16 mt-10 transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`}>
      <div className="flex flex-col items-center">
        <p 
          className={`text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-[#333333] py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: '50ms'
          }}
        >
          Olá, {userName}
        </p>
        
        <p 
          className={`text-foreground text-center text-[24px] md:text-[40px] font-normal max-w-[90%] md:max-w-[50%] leading-[1.1] mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: '100ms'
          }}
        >
          {companyPhrase}
        </p>
        
        <div 
          className={`w-full max-w-3xl transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
          style={{
            transitionDelay: '150ms'
          }}
        >
          <AIChat company={displayCompany} />
        </div>
      </div>
    </div>
  );
};
