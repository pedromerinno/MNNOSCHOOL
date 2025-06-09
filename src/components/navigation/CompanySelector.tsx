
import { useEffect, useState, memo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
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
    isLoading,
    forceGetUserCompanies
  } = useCompanies();
  
  const [displayName, setDisplayName] = useState<string>("merinno");
  
  useEffect(() => {
    if (selectedCompany?.nome) {
      console.log(`CompanySelector: Atualizando nome para "${selectedCompany.nome}"`);
      setDisplayName(selectedCompany.nome);
      
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
    }
  }, [selectedCompany]);

  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      console.log('CompanySelector: Detectada mudança na relação de empresa, atualizando dados');
      await forceGetUserCompanies(user.id);
    }
  }, [user, forceGetUserCompanies]);

  const handleCompanyNameChange = useCallback((event: CustomEvent) => {
    const { companyId, newName, company } = event.detail;
    console.log('CompanySelector: Detectada mudança no nome da empresa:', newName);
    
    if (selectedCompany?.id === companyId) {
      setDisplayName(newName);
      localStorage.setItem('selectedCompanyName', newName);
    }
  }, [selectedCompany?.id]);
  
  useEffect(() => {
    const cachedCompanyName = localStorage.getItem('selectedCompanyName');
    if (cachedCompanyName) {
      setDisplayName(cachedCompanyName);
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('company-updated', (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail.company;
      if (updatedCompany && selectedCompany?.id === updatedCompany.id) {
        setDisplayName(updatedCompany.nome);
        localStorage.setItem('selectedCompanyName', updatedCompany.nome);
      }
    });
    
    // Adicionar listener específico para mudanças de nome da empresa
    window.addEventListener('company-name-changed', handleCompanyNameChange as EventListener);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('company-updated', () => {});
      window.removeEventListener('company-name-changed', handleCompanyNameChange as EventListener);
    };
  }, [handleCompanyRelationChange, handleCompanyNameChange, selectedCompany?.id]);

  const handleCompanyChange = useCallback((company) => {
    if (!company || !user?.id) return;
    
    if (selectedCompany?.id === company.id) {
      console.log('CompanySelector: Empresa já selecionada, pulando mudança');
      return;
    }
    
    const hasAccess = userCompanies.some(c => c.id === company.id);
    if (!hasAccess) {
      console.error('CompanySelector: Usuário não tem acesso a esta empresa:', company.nome);
      toast.error(`Você não tem acesso à empresa ${company.nome}`);
      return;
    }
    
    console.log('CompanySelector: Selecionando empresa:', company.nome);
    selectCompany(user.id, company);
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
  }, [user?.id, selectedCompany?.id, selectCompany, userCompanies]);

  if (isLoading && !selectedCompany) {
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  if (!user || !userCompanies || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-foreground">merinno</span>;
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
        {Array.isArray(userCompanies) && userCompanies.map((company) => (
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
