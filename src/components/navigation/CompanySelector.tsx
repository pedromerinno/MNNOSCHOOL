
import { useEffect, memo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany, 
    isLoading 
  } = useCompanies();

  // Função para lidar com mudança de empresa
  const handleCompanyChange = useCallback((company: any) => {
    if (user?.id && company) {
      selectCompany(user.id, company);
      
      // Force immediate update of other components
      const event = new CustomEvent('company-selector-changed', { 
        detail: { company } 
      });
      window.dispatchEvent(event);
    }
  }, [user?.id, selectCompany]);

  const displayName = selectedCompany?.nome || "BUSINESS";

  if (isLoading) {
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  if (!user || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-foreground">BUSINESS</span>;
  }

  if (userCompanies.length === 1) {
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-foreground focus:outline-none">
          {displayName}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company)}
            className={`cursor-pointer ${selectedCompany?.id === company.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <div className="flex items-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.nome}
                  className="h-4 w-4 mr-2 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-4 w-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                  {company.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{company.nome}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CompanySelector.displayName = 'CompanySelector';
