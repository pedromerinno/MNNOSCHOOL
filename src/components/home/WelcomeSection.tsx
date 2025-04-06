
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
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Fetch user companies when component mounts
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setLoadingCompanies(true);
        try {
          console.log('WelcomeSection: Fetching user companies');
          const companies = await getUserCompanies(user.id);
          console.log('WelcomeSection: Fetched companies count:', companies.length);
          setLoadingCompanies(false);
        } catch (error) {
          console.error('Erro na busca das empresas:', error);
          toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
          setLoadingCompanies(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // Set display company when selected company or user companies change
  useEffect(() => {
    if (selectedCompany) {
      console.log('WelcomeSection: Using selected company:', selectedCompany.nome);
      setDisplayCompany(selectedCompany);
    } else if (userCompanies && userCompanies.length > 0) {
      console.log('WelcomeSection: No company selected, displaying first company:', userCompanies[0].nome);
      setDisplayCompany(userCompanies[0]);
      
      if (user?.id) {
        selectCompany(user.id, userCompanies[0]);
      }
    } else {
      console.log('WelcomeSection: No companies available to display');
      setDisplayCompany(null);
    }
  }, [selectedCompany, userCompanies, user, selectCompany]);

  const userName = userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/manifesto');
  };

  // Default phrase if no company is found
  const defaultPhrase = "Bem-vindo à plataforma Merinno";

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Olá, {userName}
        </p>
        
        {loadingCompanies || isLoading ? (
          // Loading state
          <div className="flex flex-col items-center w-full">
            <Skeleton className="h-12 w-3/4 mb-5" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : (
          // Content when loaded
          <>
            <p 
              className="text-[#000000] text-center text-[40px] font-normal max-w-[70%] leading-[1.1] mb-5"
            >
              {displayCompany?.frase_institucional || defaultPhrase}
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
