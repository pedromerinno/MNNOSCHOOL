
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, userCompanies, selectCompany } = useCompanies();
  const navigate = useNavigate();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tentar carregar do cache imediatamente
  useEffect(() => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        if (company?.nome) {
          console.log('Using cached company for initial display:', company.nome);
          setDisplayCompany(company);
        }
      }
    } catch (e) {
      console.error('Error parsing cached company', e);
    }
  }, []);
  
  // Buscar dados atualizados das empresas
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading) {
        try {
          setIsLoading(true);
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies, userCompanies.length, isLoading]);

  // Atualizar empresa exibida quando a seleção mudar
  useEffect(() => {
    if (selectedCompany) {
      setDisplayCompany(selectedCompany);
    } else if (userCompanies && userCompanies.length > 0) {
      console.log('No company selected, displaying first company:', userCompanies[0].nome);
      setDisplayCompany(userCompanies[0]);
      
      if (user?.id) {
        selectCompany(user.id, userCompanies[0]);
      }
    }
  }, [selectedCompany, userCompanies, user, selectCompany]);

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
          className="mt-1 flex items-center gap-2 text-white rounded-full text-sm"
          variant="default"
          style={{ 
            backgroundColor: '#000000' 
          }}
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
