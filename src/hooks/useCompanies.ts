
import { useEffect, useCallback } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanyModification } from "./company/useCompanyModification";
import { useCompanyEvents } from "./company/useCompanyEvents";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  const { user } = useAuth();
  
  const {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    isSuperAdmin,
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

  // Listen for selected company events
  useCompanyEvents(stateActions.setSelectedCompany);

  // Check if user is super admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('super_admin')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          stateActions.setIsSuperAdmin(data?.super_admin === true);
        } catch (error) {
          console.error('[useCompanies] Error checking user role:', error);
        }
      }
    };
    
    checkUserRole();
  }, [user?.id, stateActions.setIsSuperAdmin]);

  // Load initial data only when needed
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading && !skipLoadingInOnboarding) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Error loading initial company data:', error);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, userCompanies.length, isLoading, getUserCompanies, skipLoadingInOnboarding]);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    isSuperAdmin,
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
