
import { useState, useEffect } from "react";
import { Company } from "@/types/company";
import { useCompanyFetch } from "./company/useCompanyFetch";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { toast } from "sonner";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<Error | null>(null);

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

  const { selectCompany, getStoredCompanyId } = useCompanySelection({ setSelectedCompany });

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
      try {
        const { company } = event.detail;
        if (company) {
          console.log('Company selection event received:', company.nome);
          setSelectedCompany(company);
        }
      } catch (err) {
        console.error('Error processing company selection event:', err);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, []);

  // Try to restore previously selected company on hook initialization
  useEffect(() => {
    const restoreSelectedCompany = async () => {
      if (!selectedCompany && userCompanies.length > 0) {
        try {
          const storedCompanyId = getStoredCompanyId();
          
          if (storedCompanyId) {
            // First try to find in already loaded userCompanies
            const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
            
            if (storedCompany) {
              setSelectedCompany(storedCompany);
              console.log('Restored selected company from localStorage:', storedCompany.nome);
            } else {
              // If not found, try to fetch it
              try {
                const company = await getCompanyById(storedCompanyId);
                if (company) {
                  setSelectedCompany(company);
                  console.log('Restored selected company from database:', company.nome);
                }
              } catch (error) {
                console.error('Failed to restore company from localStorage', error);
                localStorage.removeItem('selectedCompanyId');
                
                // If there's at least one company available, select the first one
                if (userCompanies.length > 0) {
                  setSelectedCompany(userCompanies[0]);
                  console.log('Selected first available company:', userCompanies[0].nome);
                }
              }
            }
          } else if (userCompanies.length > 0) {
            // If no company is selected but companies are available, select the first one
            setSelectedCompany(userCompanies[0]);
            console.log('No stored company, selected first company:', userCompanies[0].nome);
          }
        } catch (err) {
          console.error('Error restoring selected company:', err);
          setError(err instanceof Error ? err : new Error('Unknown error restoring company'));
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId]);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
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
