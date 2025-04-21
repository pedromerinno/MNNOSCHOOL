
import { memo, useCallback, useEffect, useState, useRef } from "react";
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
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies,
    setCompanyContentLoaded
  } = useCompanies();
  
  const { displayName, setDisplayName } = useCompanyNameDisplay(selectedCompany);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const { invalidateCache } = useCompanyCache();
  const initialSelectionMadeRef = useRef(false);
  
  // Create a wrapper function with the correct return type
  const handleForceGetUserCompanies = async (userId: string): Promise<any> => {
    console.log('CompanySelector: Forcing refresh of user companies');
    invalidateCache(); // Invalidar cache antes de forçar atualização
    return await forceGetUserCompanies(userId);
  };
  
  // Use the new central event handler
  useCompanyEvents({
    userId: user?.id,
    forceGetUserCompanies: handleForceGetUserCompanies,
    setDisplayName
  });

  // Always select the first company if there's no selected company and companies exist
  useEffect(() => {
    if (user?.id && 
        userCompanies.length > 0 && 
        !selectedCompany && 
        !initialLoadAttempted && 
        !initialSelectionMadeRef.current) {
      console.log('CompanySelector: Auto-selecting the first company:', userCompanies[0].nome);
      initialSelectionMadeRef.current = true;
      selectCompany(user.id, userCompanies[0]);
      setInitialLoadAttempted(true);
      
      // Update the display name immediately
      setDisplayName(userCompanies[0].nome);
      
      // Disparar evento para garantir que todos os componentes sejam atualizados
      const updateEvent = new CustomEvent('company-updated', {
        detail: { company: userCompanies[0] }
      });
      
      // Pequeno atraso para garantir que o evento de seleção foi processado primeiro
      setTimeout(() => {
        window.dispatchEvent(updateEvent);
      }, 100);
    }
  }, [user?.id, userCompanies, selectedCompany, selectCompany, setDisplayName, initialLoadAttempted]);

  // Force initial load when component mounts - but only once
  useEffect(() => {
    if (user?.id && !isLoading && userCompanies.length === 0 && !initialLoadAttempted) {
      console.log('CompanySelector: No companies loaded, forcing initial load');
      setInitialLoadAttempted(true);
      invalidateCache(); // Invalidar cache antes de forçar atualização
      forceGetUserCompanies(user.id).catch(err => {
        console.error('Error forcing initial company load:', err);
        toast.error('Error loading companies. Please refresh the page.');
      });
    }
  }, [user?.id, isLoading, userCompanies.length, forceGetUserCompanies, initialLoadAttempted, invalidateCache]);

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
    invalidateCache(); // Invalidar cache antes de selecionar empresa
    selectCompany(user.id, company);
    
    // Resetar o estado de carregamento de conteúdo para a nova empresa
    if (setCompanyContentLoaded) {
      setCompanyContentLoaded(false);
    }
    
    // Update display name immediately
    setDisplayName(company.nome);
    
    toast.success(`Company ${company.nome} selected successfully!`);
  }, [user?.id, selectedCompany?.id, selectCompany, userCompanies, setDisplayName, setCompanyContentLoaded, invalidateCache]);

  if (isLoading && !selectedCompany) {
    return <CompanyName displayName={displayName || "Loading..."} />;
  }

  if (!user || !userCompanies || userCompanies.length === 0) {
    return <CompanyName displayName={displayName || "merinno"} />;
  }

  if (userCompanies.length === 1) {
    return <CompanyName displayName={displayName || userCompanies[0].nome} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-merinno-dark focus:outline-none">
          {displayName || (selectedCompany?.nome || "Select Company")}
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
