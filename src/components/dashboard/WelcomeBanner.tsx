
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";

interface WelcomeBannerProps {
  company: Company | null;
}

export const WelcomeBanner = ({ company }: WelcomeBannerProps) => {
  const { userProfile } = useAuth();
  const userName = userProfile?.display_name || 'Estudante';

  return (
    <div className="bg-merinno-blue/10 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Bem-vindo de volta, {userName}!
          </h1>
          {company?.frase_institucional && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {company.frase_institucional}
            </p>
          )}
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
