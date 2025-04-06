
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

  if (isLoading) {
    return (
      <div className="mb-16 mt-10">
        <div className="flex flex-col items-center">
          <Skeleton className="h-8 w-32 mb-6 rounded-full" />
          <Skeleton className="h-20 w-[50%] mb-5" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    );
  }

  const defaultPhrase = "Juntos, estamos desenhando o futuro de grandes empresas";

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
      </div>
    </div>
  );
};
