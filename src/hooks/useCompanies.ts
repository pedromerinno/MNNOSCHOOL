
import { useEffect, useCallback, useRef } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanyModification } from "./company/useCompanyModification";
import { useCompanyEvents } from "./company/useCompanyEvents";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  const { user } = useAuth();
  const initialDataLoaded = useRef(false);
  
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
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  } = useCompanySelection({ 
    setSelectedCompany: stateActions.setSelectedCompany 
  });

  const {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  } = useCompanyModification({
    ...stateActions
  });

  const {
    assignUserToCompany,
    removeUserFromCompany
  } = useCompanyUserManagement();

  useCompanyEvents(stateActions.setSelectedCompany);

  // Load initial data when component mounts
  const loadInitialData = useCallback(async () => {
    if (initialDataLoaded.current || skipLoadingInOnboarding || !user?.id || isLoading) {
      return;
    }

    try {
      initialDataLoaded.current = true;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', user.id)
        .single();
      
      if (profileData?.super_admin) {
        await fetchCompanies();
      } else {
        await getUserCompanies(user.id);
      }
    } catch (error) {
      console.error('[useCompanies] Error loading initial data:', error);
    }
  }, [user?.id, isLoading, getUserCompanies, skipLoadingInOnboarding, fetchCompanies]);

  useEffect(() => {
    if (user?.id && !initialDataLoaded.current) {
      loadInitialData();
    }
  }, [loadInitialData, user?.id]);

  // Handle company relation changes
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    }
  }, [user?.id, forceGetUserCompanies]);

  // Handle force reload
  const handleForceReload = useCallback(async () => {
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    } else {
      await fetchCompanies();
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);

  // Set up event listeners
  useEffect(() => {
    if (skipLoadingInOnboarding) return;

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
