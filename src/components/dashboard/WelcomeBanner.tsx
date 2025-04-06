
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";

interface WelcomeBannerProps {
  company: Company | null;
}

export const WelcomeBanner = ({ company }: WelcomeBannerProps) => {
  const { userProfile } = useAuth();
  const userName = userProfile?.displayName || 'Estudante';

  // Função para exibir apenas a frase institucional sem fallback
  const getCompanyPhrase = () => {
    console.log("WelcomeBanner - Empresa:", company);
    console.log("WelcomeBanner - Frase institucional:", company?.frase_institucional);
    
    if (!company) return null;
    
    if (company.frase_institucional) {
      return company.frase_institucional;
    }
    
    return null;
  };

  const companyPhrase = getCompanyPhrase();

  return (
    <div className="bg-merinno-blue/10 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Bem-vindo de volta, {userName}!
          </h1>
          {companyPhrase ? (
            <p className="text-gray-600 max-w-xl">
              {companyPhrase}
            </p>
          ) : null}
        </div>
        <Button
          className="mt-4 md:mt-0 bg-merinno-blue hover:bg-merinno-blue/90 text-white flex items-center gap-2"
        >
          <CalendarCheck className="h-4 w-4" />
          Ver minha agenda
        </Button>
      </div>
    </div>
  );
};
