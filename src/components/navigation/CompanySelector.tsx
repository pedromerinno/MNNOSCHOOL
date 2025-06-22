import { useEffect, memo, useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  
  const [displayName, setDisplayName] = useState<string>("");

  // Atualizar displayName sempre que selectedCompany mudar
  useEffect(() => {
    if (selectedCompany?.nome) {
      setDisplayName(selectedCompany.nome);
    } else if (userCompanies.length > 0) {
      setDisplayName(userCompanies[0].nome);
    } else {
      // Só mostrar BUSINESS se não há empresas carregadas ainda
      if (!isLoading) {
        setDisplayName("BUSINESS");
      }
    }
  }, [selectedCompany, userCompanies, isLoading]);

  // Função para lidar com mudança de empresa
  const handleCompanyChange = useCallback((company: any) => {
    if (user?.id && company) {
      selectCompany(user.id, company);
      setDisplayName(company.nome);
      
      // Force immediate update of other components
      const event = new CustomEvent('company-selector-changed', { 
        detail: { company } 
      });
      window.dispatchEvent(event);
    }
  }, [user?.id, selectCompany]);

  // Escutar mudanças de empresa vindas de outras partes da aplicação
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company?.nome) {
        setDisplayName(company.nome);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-changed', handleCompanyUpdate as EventListener);
    window.addEventListener('company-selected', handleCompanyUpdate as EventListener);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-changed', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-selected', handleCompanyUpdate as EventListener);
    };
  }, []);

  // Durante o loading, não mostrar nada se há empresas para carregar
  if (isLoading) {
    // Se há uma empresa selecionada ou empresas no cache, mostrar o nome
    if (selectedCompany?.nome) {
      return (
        <span className="text-lg font-bold text-foreground">{selectedCompany.nome}</span>
      );
    }
    if (userCompanies.length > 0) {
      return (
        <span className="text-lg font-bold text-foreground">{userCompanies[0].nome}</span>
      );
    }
    // Durante loading inicial, não mostrar nada para evitar o flash de BUSINESS
    return <span className="text-lg font-bold text-foreground"></span>;
  }

  if (!user || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-foreground">BUSINESS</span>;
  }

  if (userCompanies.length === 1) {
    return (
      <span className="text-lg font-bold text-foreground">{displayName}</span>
    );
  }

  // Não renderizar o dropdown se displayName está vazio (evita flash)
  if (!displayName) {
    return <span className="text-lg font-bold text-foreground"></span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 text-lg font-bold text-foreground focus:outline-none">
          <span>{displayName}</span>
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
