
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading } = useCompanies();

  // Initial fetch of user companies on component mount
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
  }, [user, getUserCompanies]);

  // Use displayName from userProfile if available, otherwise extract from email
  const userName = userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário';

  // Função para exibir a frase institucional sem placeholder
  const getCompanyPhrase = () => {
    console.log("Frase institucional:", selectedCompany?.frase_institucional);
    if (selectedCompany?.frase_institucional) {
      return selectedCompany.frase_institucional;
    }
    return null;
  };

  const companyPhrase = getCompanyPhrase();

  return (
    <div className="mb-16 mt-10">
      <div className="flex justify-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-8 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-2.5 px-8 rounded-full max-w-fit text-lg"
        >
          Olá, {userName}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Skeleton className="h-14 w-3/4 max-w-lg my-5" />
          <Skeleton className="h-14 w-1/2 max-w-md mb-10" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {companyPhrase && (
            <h1 className="text-4xl md:text-5xl text-center mb-10 mt-6 font-medium dark:text-white leading-tight">
              {companyPhrase}
            </h1>
          )}
        </div>
      )}
    </div>
  );
};
