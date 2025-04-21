
import { memo, useCallback } from "react";
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
  
  useCompanyEvents({
    userId: user?.id,
    forceGetUserCompanies,
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
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
  }, [user?.id, selectedCompany?.id, selectCompany, userCompanies]);

  if (isLoading && !selectedCompany) {
    return <CompanyName displayName={displayName} />;
  }

  if (!user || !userCompanies || userCompanies.length === 0) {
    return <CompanyName displayName="merinno" />;
  }

  if (userCompanies.length === 1) {
    return <CompanyName displayName={displayName} />;
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
