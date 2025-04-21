
import { useEffect, useCallback } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyInitialization } from "./company/useCompanyInitialization";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/types/company";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  const { user } = useAuth();
  
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

  const { loadInitialData } = useCompanyInitialization({
    skipLoadingInOnboarding,
    setUserCompanies,
    setIsLoading,
    getUserCompanies
  });

  const { createCompany, fetchCompanies } = useCompanyCreate({ 
    setIsLoading, 
    setCompanies 
  });
  
  const { selectCompany } = useCompanySelection({ 
    setSelectedCompany 
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

  // Run loadInitialData on component mount or when user changes
  useEffect(() => {
    if (user?.id) {
      loadInitialData(user.id);
    }
  }, [loadInitialData, user?.id]);

  // Event handler for force reload
  const handleForceReload = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanies] Forçando recarregamento de empresas por solicitação do usuário');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanies] Erro ao forçar recarregamento de empresas:', error);
      }
    } else {
      try {
        console.log('[useCompanies] Forçando recarregamento de todas as empresas por solicitação do usuário');
        await fetchCompanies();
      } catch (error) {
        console.error('[useCompanies] Erro ao forçar recarregamento de todas as empresas:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);

  // Listen for force reload events
  useEffect(() => {
    window.addEventListener('force-reload-companies', handleForceReload);
    return () => {
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [handleForceReload]);

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
