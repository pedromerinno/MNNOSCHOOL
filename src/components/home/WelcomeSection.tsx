
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const WelcomeSection = () => {
  const navigate = useNavigate();
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

  const handleLearnMore = () => {
    navigate('/manifesto');
  };

  // Use displayName from userProfile if available, otherwise extract from email
  const userName = userProfile.displayName || user?.email?.split('@')[0] || 'Usuário';

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
          <Skeleton className="h-12 w-80 rounded-full mt-8" />
        </div>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl text-center mb-10 mt-6 font-medium dark:text-white leading-tight">
            {selectedCompany && selectedCompany.frase_institucional ? (
              selectedCompany.frase_institucional
            ) : (
              <>
                Juntos, estamos desenhando<br />
                o futuro de grandes empresas
              </>
            )}
          </h1>
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleLearnMore}
              className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-white rounded-full py-6 px-8 text-base"
            >
              {selectedCompany ? (
                `Clique para saber mais sobre a ${selectedCompany.nome}`
              ) : (
                "Clique para saber mais sobre a MNNO"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
