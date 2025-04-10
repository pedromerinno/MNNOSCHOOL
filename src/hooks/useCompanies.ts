
import { useEffect } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyEvents } from "./company/useCompanyEvents";
import { useAuth } from "@/contexts/AuthContext";

export const useCompanies = () => {
  // Get auth context for global access
  const { user } = useAuth();
  
  // Use specialized hooks for state management
  const {
    isLoading,
    setIsLoading,
    companies,
    setCompanies,
    userCompanies,
    setUserCompanies,
    selectedCompany,
    setSelectedCompany,
    error,
    setError,
    fetchCount,
    incrementFetchCount,
    resetError
  } = useCompanyState();
  
  // Hook for company fetching operations
  const {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    setUserCompanies,
    setSelectedCompany,
    setIsLoading,
    setError,
    incrementFetchCount
  });
  
  // Import functionality from individual hooks
  const { fetchCompanies } = useCompanyFetch({ 
    setIsLoading, 
    setCompanies, 
    setUserCompanies, 
    setSelectedCompany 
  });
  
  const { 
    selectCompany, 
    getStoredCompanyId, 
    getStoredCompany 
  } = useCompanySelection({ 
    setSelectedCompany 
  });
  
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
  useCompanyEvents(setSelectedCompany);
  
  // Global data loading - load user companies only when user is logged in
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Error loading initial company data:', error);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, userCompanies.length, isLoading, getUserCompanies]);
  
  // Listen for company-relation-changed events to refresh data
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        try {
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('Error refreshing companies after relation change:', error);
        }
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [user?.id, forceGetUserCompanies]);
  
  // Try to restore previously selected company on hook initialization
  useEffect(() => {
    const restoreSelectedCompany = async () => {
      // Skip if we already have a selected company
      if (selectedCompany) return;
      
      // First try to get the full company object from local storage
      const cachedCompany = getStoredCompany();
      if (cachedCompany) {
        console.log('Restored selected company from cache:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      }
      
      // If we have userCompanies but no selected company yet
      if (userCompanies.length > 0) {
        const storedCompanyId = getStoredCompanyId();
        
        if (storedCompanyId) {
          // Try to find in already loaded userCompanies
          const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
          
          if (storedCompany) {
            setSelectedCompany(storedCompany);
            console.log('Restored selected company from localStorage ID:', storedCompany.nome);
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
              
              // If fetch failed but we have userCompanies, select the first one
              if (userCompanies.length > 0) {
                setSelectedCompany(userCompanies[0]);
                console.log('Selected first available company after fetch failure:', userCompanies[0].nome);
              }
            }
          }
        } else if (userCompanies.length === 1) {
          // Automatically select the only company if there's just one
          setSelectedCompany(userCompanies[0]);
          console.log('Auto-selected the only available company:', userCompanies[0].nome);
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId, getStoredCompany, setSelectedCompany]);
  
  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    fetchCompanies,
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany,
    user
  };
};
