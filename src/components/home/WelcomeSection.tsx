
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

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-2.5 px-8 rounded-full max-w-fit text-lg"
        >
          Olá, {userName}
        </p>
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
      </div>
    </div>
  );
};
