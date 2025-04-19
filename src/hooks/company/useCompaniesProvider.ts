
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./useCompanyState";
import { useCompanyFetching } from "./useCompanyFetching";
import { useCompanyModification } from "./useCompanyModification";
import { useEffect } from "react";

export const useCompaniesProvider = () => {
  const { user } = useAuth();
  
  const {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    ...stateActions
  } = useCompanyState();
  
  const { 
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    ...stateActions
  });
  
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

  // Global data loading - load user companies only when user is logged in
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Error loading initial company data:', error);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, userCompanies.length, isLoading, getUserCompanies]);

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
