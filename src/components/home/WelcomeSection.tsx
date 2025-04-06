
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setIsLoading(true);
        setError(null);
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
          setError("Não foi possível carregar os dados da empresa.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

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

  const userName = userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/manifesto');
  };

  const defaultMessage = "Juntos, estamos desenhando o futuro de grandes empresas";

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-2.5 px-8 rounded-full max-w-fit text-lg"
        >
          Olá, {userName}
        </p>
        
        {isLoading ? (
          <p className="animate-pulse text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-6">
            Carregando...
          </p>
        ) : error ? (
          <p className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-6">
            {defaultMessage}
          </p>
        ) : (
          <p className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-6">
            {displayCompany?.frase_institucional || defaultMessage}
          </p>
        )}
        
        {(displayCompany || (!isLoading && error)) && (
          <Button 
            onClick={handleLearnMore} 
            className="mt-6 flex items-center gap-2 text-white bg-black rounded-full text-sm"
            variant="default"
          >
            Saiba mais sobre {displayCompany?.nome || "nossa empresa"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
