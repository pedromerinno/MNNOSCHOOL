
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const WelcomeSection = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { getUserCompanies } = useCompanies();
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch of user companies on component mount
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Get all companies the user is related to
          const companies = await getUserCompanies(user.id);
          
          if (companies.length > 0) {
            // If user has companies, use the first one as default
            setUserCompany(companies[0]);
            console.log('WelcomeSection: Using first available company', companies[0].nome);
          } else {
            toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
          }
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
          toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { userId, company } = event.detail;
      
      console.log('WelcomeSection: Company selection event received', { userId, company, currentUserId: user?.id });
      
      if (userId && company && user?.id === userId) {
        console.log('WelcomeSection: Updated company after selection', company.nome);
        setUserCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [user]);

  const handleLearnMore = () => {
    navigate('/manifesto');
  };

  // Use displayName from userProfile if available, otherwise extract from email
  const userName = userProfile.displayName || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="mb-16 mt-8">
      <div className="flex justify-center">
        <p 
          className="text-gray-600 dark:text-gray-300 mb-2 text-center bg-[#FFF1E0] dark:bg-amber-900/30 py-2.5 px-4 rounded-full max-w-fit"
        >
          Olá, {userName}
        </p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center">
          <Skeleton className="h-12 w-3/4 max-w-lg my-5" />
          <Skeleton className="h-12 w-1/2 max-w-md mb-5" />
          <Skeleton className="h-10 w-56 rounded-full mt-6" />
        </div>
      ) : (
        <>
          <h1 className="text-3xl md:text-4xl text-center my-5 font-medium dark:text-white">
            {userCompany && userCompany.frase_institucional ? (
              userCompany.frase_institucional
            ) : (
              <>
                Juntos, estamos desenhando<br />
                o futuro de grandes empresas
              </>
            )}
          </h1>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleLearnMore}
              className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-white rounded-full px-6"
            >
              {userCompany ? (
                `Clique aqui para saber mais sobre a ${userCompany.nome}`
              ) : (
                "Clique para saber mais sobre a MERINNO"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
