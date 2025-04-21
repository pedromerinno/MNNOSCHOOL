
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
  
  // Create a wrapper function with the correct return type
  const handleForceGetUserCompanies = async (userId: string): Promise<any> => {
    return await forceGetUserCompanies(userId);
  };
  
  useCompanyEvents({
    userId: user?.id,
    forceGetUserCompanies: handleForceGetUserCompanies,
    setDisplayName
  });

  // Auto-select the first company if there's only one and none selected
  useEffect(() => {
    if (user?.id && userCompanies.length === 1 && !selectedCompany) {
      console.log('CompanySelector: Auto-selecting the only company:', userCompanies[0].nome);
      selectCompany(user.id, userCompanies[0]);
      
      // Dispatch a company selected event
      const event = new CustomEvent('company-selected', {
        detail: { company: userCompanies[0] }
      });
      window.dispatchEvent(event);
    }
  }, [user?.id, userCompanies, selectedCompany, selectCompany]);

  const handleCompanyChange = useCallback((company: Company) => {
    if (!company || !user?.id) return;
    
    if (selectedCompany?.id === company.id) {
      console.log('CompanySelector: Company already selected, skipping change');
      return;
    }
    
    const hasAccess = userCompanies.some(c => c.id === company.id);
    if (!hasAccess) {
      console.error('CompanySelector: User does not have access to this company:', company.nome);
      toast.error(`You do not have access to company ${company.nome}`);
      return;
    }
    
    console.log('CompanySelector: Selecting company:', company.nome);
    selectCompany(user.id, company);
    
    // Dispatch a company selected event
    const event = new CustomEvent('company-selected', {
      detail: { company }
    });
    window.dispatchEvent(event);
    
    toast.success(`Company ${company.nome} selected successfully!`);
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
