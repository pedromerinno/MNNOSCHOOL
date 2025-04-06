
import { useState, useCallback, useEffect } from "react";
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
  const [error, setError] = useState<Error | null>(null);

  // Import functionality from individual hooks
  const { 
    fetchCompanies, 
    getUserCompanies: fetchUserCompanies, 
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

  // Memoized function to get user companies
  const getUserCompanies = useCallback(async (userId: string) => {
    if (!userId) {
      console.warn("getUserCompanies called without a user ID");
      return [];
    }
    
    try {
      setError(null);
      return await fetchUserCompanies(userId);
    } catch (err) {
      console.error("Error in getUserCompanies:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, [fetchUserCompanies]);

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

  // Try to restore previously selected company on hook initialization
  useEffect(() => {
    const restoreSelectedCompany = async () => {
      if (!selectedCompany && userCompanies.length > 0) {
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
              // Clear invalid company ID
              localStorage.removeItem('selectedCompanyId');
              
              // Fall back to first company
              if (userCompanies.length > 0) {
                setSelectedCompany(userCompanies[0]);
                console.log('Falling back to first company:', userCompanies[0].nome);
              }
            }
          }
        } else if (userCompanies.length === 1) {
          // Auto-select if there's only one company
          setSelectedCompany(userCompanies[0]);
          console.log('Auto-selecting single company:', userCompanies[0].nome);
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId]);

  return {
    isLoading,
    error,
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
