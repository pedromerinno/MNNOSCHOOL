
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const WelcomeSection = () => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  
  const currentTime = format(new Date(), "HH:mm", { locale: ptBR });
  const currentDate = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <Card className="mb-4 sm:mb-8 border-0 shadow-sm bg-white/80 dark:bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
              {getGreeting()}, {userProfile?.display_name || "Usuário"}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-0">
              Pronto para mais um dia produtivo?
            </p>
          </div>
          
          <div className="flex flex-col sm:items-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{currentTime} • {currentDate}</span>
            </div>
            
            {selectedCompany && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <Badge 
                  variant="outline" 
                  className="text-xs sm:text-sm bg-white/80 dark:bg-card/80 border-gray-200 dark:border-gray-700 max-w-[200px] truncate"
                  style={{ 
                    borderColor: selectedCompany.cor_principal || "#1EAEDB",
                    color: selectedCompany.cor_principal || "#1EAEDB"
                  }}
                >
                  {selectedCompany.nome}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
