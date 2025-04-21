
import { memo, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyNameDisplay } from "@/hooks/company/useCompanyNameDisplay";
import { useCompanyEvents } from "@/hooks/company/useCompanyEvents";
import { CompanyName } from "./company/CompanyName";
import { CompanyMenuItem } from "./company/CompanyMenuItem";
import { Company } from "@/types/company";

export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies
  } = useCompanies();
  
  const { displayName, setDisplayName } = useCompanyNameDisplay(selectedCompany);
  
  // Force update when component mounts
  useEffect(() => {
    if (user?.id) {
      console.log("[CompanySelector] Initial load - forcing company refresh");
      forceGetUserCompanies(user.id).catch(err => {
        console.error("[CompanySelector] Error loading companies:", err);
      });
    }
  }, [user?.id, forceGetUserCompanies]);
  
  const handleForceGetUserCompanies = async (userId: string): Promise<any> => {
    return await forceGetUserCompanies(userId);
  };
  
  useCompanyEvents({
    userId: user?.id,
    forceGetUserCompanies: handleForceGetUserCompanies,
    setDisplayName
  });

  const handleCompanyChange = useCallback((company: Company) => {
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
    setDisplayName(company.nome);
    localStorage.setItem('selectedCompanyName', company.nome);
    localStorage.setItem('selectedCompanyId', company.id);
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    
    // Reload page to ensure all components reflect the new company
    window.location.reload();
  }, [user?.id, selectedCompany?.id, selectCompany, userCompanies, setDisplayName]);

  if (isLoading && !selectedCompany) {
    return <CompanyName displayName={displayName} />;
  }

  if (!user || !userCompanies || userCompanies.length === 0) {
    return <CompanyName displayName="MNNO" />;
  }

  if (userCompanies.length === 1) {
    // If there's only one company, make sure it's selected
    if (user?.id && (!selectedCompany || selectedCompany.id !== userCompanies[0].id)) {
      console.log('CompanySelector: Auto-selecting the only company:', userCompanies[0].nome);
      selectCompany(user.id, userCompanies[0]);
      setDisplayName(userCompanies[0].nome);
      localStorage.setItem('selectedCompanyName', userCompanies[0].nome);
      localStorage.setItem('selectedCompanyId', userCompanies[0].id);
    }
    return <CompanyName displayName={displayName || userCompanies[0].nome} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-merinno-dark focus:outline-none">
          {displayName}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {Array.isArray(userCompanies) && userCompanies.map((company) => (
          <CompanyMenuItem
            key={company.id}
            company={company}
            isSelected={selectedCompany?.id === company.id}
            onSelect={handleCompanyChange}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CompanySelector.displayName = 'CompanySelector';
