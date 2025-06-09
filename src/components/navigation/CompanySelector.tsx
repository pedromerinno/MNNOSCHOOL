
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
  console.log('[CompanySelector] Rendering...');
  
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany, 
    isLoading 
  } = useCompanies();

  console.log('[CompanySelector] Current state:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoading,
    userId: user?.id || 'no user'
  });

  // Função para lidar com mudança de empresa
  const handleCompanyChange = useCallback((company: any) => {
    console.log('[CompanySelector] ================');
    console.log('[CompanySelector] HANDLING COMPANY CHANGE');
    console.log('[CompanySelector] From:', selectedCompany?.nome || 'none');
    console.log('[CompanySelector] To:', company.nome);
    console.log('[CompanySelector] User ID:', user?.id);
    console.log('[CompanySelector] ================');
    
    if (user?.id && company) {
      selectCompany(user.id, company);
      
      // Force immediate update of other components
      const event = new CustomEvent('company-selector-changed', { 
        detail: { company } 
      });
      window.dispatchEvent(event);
    } else {
      console.error('[CompanySelector] Missing user ID or company');
    }
  }, [user?.id, selectCompany, selectedCompany]);

  // Show current selected company in logs when it changes
  useEffect(() => {
    if (selectedCompany) {
      console.log('[CompanySelector] ✅ Selected company updated to:', selectedCompany.nome);
    }
  }, [selectedCompany]);

  const displayName = selectedCompany?.nome || "merinno";

  if (isLoading) {
    console.log('[CompanySelector] Showing loading state');
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  if (!user || userCompanies.length === 0) {
    console.log('[CompanySelector] No user or companies, showing default');
    return <span className="text-lg font-bold text-foreground">merinno</span>;
  }

  if (userCompanies.length === 1) {
    console.log('[CompanySelector] Only one company, showing without dropdown');
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  console.log('[CompanySelector] Rendering dropdown with companies:', userCompanies.map(c => c.nome));

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
