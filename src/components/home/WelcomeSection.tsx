
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
  const { getUserCompany } = useCompanies();
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchUserCompany = async () => {
      if (user?.id) {
        setLoading(true);
        setFetchError(false);
        try {
          const result = await getUserCompany(user.id);
          console.log('Resultado da busca da empresa:', result);
          
          if (result.error) {
            setFetchError(true);
            console.error('Erro ao buscar empresa:', result.error);
            toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
          } else {
            setUserCompany(result.company);
          }
        } catch (error) {
          console.error('Erro na busca da empresa:', error);
          setFetchError(true);
          toast.error("Não foi possível carregar os dados da empresa. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompany();
  }, [user, getUserCompany]);

  // Listen for company selection events from CompanySelector or UserNavigation
  useEffect(() => {
    const handleCompanySelected = async (event: CustomEvent) => {
      const { userId, companyId } = event.detail;
      
      if (userId && companyId && user?.id === userId) {
        setLoading(true);
        try {
          const result = await getUserCompany(userId);
          if (!result.error) {
            setUserCompany(result.company);
          }
        } catch (error) {
          console.error('Erro ao atualizar empresa selecionada:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [user, getUserCompany]);

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
