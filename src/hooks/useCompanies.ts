
import { useState, useEffect } from "react";
import { Company } from "@/types/company";
import { useCompanyFetch } from "./company/useCompanyFetch";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Import functionality from individual hooks
  const { 
    fetchCompanies, 
    getUserCompanies, 
    getCompanyById 
  } = useCompanyFetch({ 
    setIsLoading, 
    setCompanies, 
    setUserCompanies, 
    setSelectedCompany 
  });

  const { selectCompany } = useCompanySelection({ setSelectedCompany });

  const { createCompany } = useCompanyCreate({ 
    setIsLoading, 
    setCompanies 
  });

  const { updateCompany } = useCompanyUpdate({ 
    setIsLoading, 
    setCompanies, 
    selectedCompany, 
    setSelectedCompany 
  });

  const { deleteCompany } = useCompanyDelete({ 
    setIsLoading, 
    setCompanies, 
    selectedCompany, 
    setSelectedCompany 
  });

  const { 
    assignUserToCompany, 
    removeUserFromCompany 
  } = useCompanyUserManagement();

  // Listen for company selection events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company) {
        setSelectedCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, []);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    fetchCompanies,
    getUserCompanies,
    getCompanyById,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  };
};
