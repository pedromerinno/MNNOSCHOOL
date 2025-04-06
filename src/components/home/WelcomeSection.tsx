import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";
import { Skeleton } from "@/components/ui/skeleton";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, userCompanies, selectCompany, isLoading } = useCompanies();
  const navigate = useNavigate();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  useEffect(() => {
    const cachedCompany = localStorage.getItem('selectedCompany');
    if (cachedCompany) {
      try {
        const parsedCompany = JSON.parse(cachedCompany) as Company;
        console.log('Using cached company for initial display:', parsedCompany.nome);
        setDisplayCompany(parsedCompany);
        setIsLoadingLocal(false);
      } catch (e) {
        console.error('Error parsing cached company', e);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          setFetchAttempted(true);
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
          toast.error("Não foi possível carregar os dados da empresa. Usando dados em cache se disponíveis.");
        } finally {
          setTimeout(() => setIsLoadingLocal(false), 100);
        }
      } else {
        setIsLoadingLocal(false);
      }
    };

    if (!fetchAttempted) {
      fetchUserCompanies();
    } else if (!isLoading) {
      setIsLoadingLocal(false);
    }
  }, [user, getUserCompanies, fetchAttempted, isLoading]);

  useEffect(() => {
    if (selectedCompany) {
      setDisplayCompany(selectedCompany);
    } else if (userCompanies && userCompanies.length > 0) {
      console.log('No company selected, displaying first company:', userCompanies[0].nome);
      setDisplayCompany(userCompanies[0]);
      
      if (user?.id) {
        selectCompany(user.id, userCompanies[0]);
      }
    } else if (!displayCompany) {
      const cachedCompany = localStorage.getItem('selectedCompany');
      if (cachedCompany) {
        try {
          const parsedCompany = JSON.parse(cachedCompany) as Company;
          console.log('Using cached company for display:', parsedCompany.nome);
          setDisplayCompany(parsedCompany);
        } catch (e) {
          console.error('Error parsing cached company', e);
        }
      }
    }
  }, [selectedCompany, userCompanies, user, selectCompany, displayCompany]);

  const userName = userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/manifesto');
  };

  const defaultPhrase = "Juntos, estamos desenhando o futuro de grandes empresas";

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Olá, {userName}
        </p>
        
        {isLoadingLocal && !displayCompany ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            <Skeleton className="h-[40px] w-[80%] max-w-[600px] rounded-lg mb-1" />
            <Skeleton className="h-[40px] w-[60%] max-w-[500px] rounded-lg mb-5" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        ) : (
          <>
            <p 
              className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
            >
              {displayCompany?.frase_institucional || defaultPhrase}
            </p>
            
            {!isLoadingLocal && displayCompany && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};
