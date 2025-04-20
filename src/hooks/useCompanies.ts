
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanyModification } from "./company/useCompanyModification";
import { useCompanyEventHandlers } from "./company/useCompanyEventHandlers";
import { useInitialCompanyData } from "./company/useInitialCompanyData";
import { useSelectedCompanyManagement } from "./company/useSelectedCompanyManagement";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  const { user } = useAuth();

  // Use specialized hooks for state management
  const {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    ...stateActions
  } = useCompanyState();

  // Hook for company fetching operations
  const {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    ...stateActions
  });

  // Hook for company modifications
  const {
    fetchCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  } = useCompanyModification({
    ...stateActions
  });

  // Event handlers
  const {
    handleCompanyRelationChange,
    handleForceReload
  } = useCompanyEventHandlers({
    user,
    forceGetUserCompanies,
    fetchCompanies
  });

  // Initial data loading
  useInitialCompanyData({
    user,
    skipLoadingInOnboarding,
    setUserCompanies: stateActions.setUserCompanies,
    getUserCompanies
  });

  // Selected company management
  useSelectedCompanyManagement({
    selectedCompany,
    userCompanies,
    getCompanyById,
    setSelectedCompany: stateActions.setSelectedCompany,
    skipLoadingInOnboarding
  });

  // Event listeners setup
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }

    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('force-reload-companies', handleForceReload);

    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [handleCompanyRelationChange, handleForceReload, skipLoadingInOnboarding]);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    fetchCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany,
    user
  };
};
