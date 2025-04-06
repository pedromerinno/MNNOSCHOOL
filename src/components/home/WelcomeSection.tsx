
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, userCompanies, selectCompany, isLoading, error } = useCompanies();
  const navigate = useNavigate();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
          toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies, retryCount]);

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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Olá, {userName}
        </p>
        
        {error ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Erro ao buscar empresas</p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              Não foi possível carregar os dados da empresa. Verifique sua conexão e tente novamente.
            </p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Tentar novamente
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center py-6">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-1/2 rounded-full mb-4"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-1/4 rounded-full"></div>
          </div>
        ) : (
          <>
            <p 
              className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
            >
              {displayCompany?.frase_institucional || "Juntos, estamos desenhando o futuro de grandes empresas"}
            </p>
            {displayCompany && (
              <Button 
                onClick={handleLearnMore} 
                className="mt-1 flex items-center gap-2 text-white rounded-full text-sm"
                variant="default"
                style={{ 
                  backgroundColor: displayCompany.cor_principal || '#000000' 
                }}
              >
                Saiba mais sobre {displayCompany.nome}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
