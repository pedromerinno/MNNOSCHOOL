
import { useEffect, useCallback, useRef } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreateUpdates";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyEvents } from "./company/useCompanyEvents";
import { useCompanyGlobalState } from "./company/useCompanyGlobalState";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  
  // Get global state management
  const { hookId, globalState } = useCompanyGlobalState();
  
  // Get auth context for global access
  const { user } = useAuth();
  const initialDataLoaded = useRef(false);
  const hasRegistered = useRef(false);
  
  // Register hook with global state
  useEffect(() => {
    if (!hasRegistered.current) {
      globalState.registerHook(hookId);
      hasRegistered.current = true;
    }
    
    return () => {
      if (hasRegistered.current) {
        globalState.unregisterHook(hookId);
        hasRegistered.current = false;
      }
    };
  }, [hookId, globalState]);
  
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
  const { 
    createCompany,
    fetchCompanies
  } = useCompanyCreate({ 
    setIsLoading, 
    setCompanies,
    setError 
  });
  
  const { 
    selectCompany, 
    getStoredCompanyId, 
    getStoredCompany 
  } = useCompanySelection({ 
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
  
  // Listen for company selection events
  useCompanyEvents(setSelectedCompany);
  
  // Simplified and faster initial data loading
  const loadInitialData = useCallback(async () => {
    if (skipLoadingInOnboarding || !user?.id || initialDataLoaded.current) {
      return;
    }
    
    try {
      initialDataLoaded.current = true;
      
      // Try to get stored company first for immediate UI update
      const storedCompany = getStoredCompany();
      if (storedCompany) {
        setSelectedCompany(storedCompany);
      }
      
      // Check if user is super admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', user.id)
        .single();
      
      if (profileData?.super_admin) {
        // For super admin, get all companies directly
        const { data: allCompanies, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome')
          .limit(20);
        
        if (companiesError) {
          throw companiesError;
        }
        
        setUserCompanies(allCompanies || []);
      } else {
        await getUserCompanies(user.id);
      }
      
    } catch (error) {
      console.error(`[useCompanies-${hookId}] Error loading initial company data:`, error);
      setError(error instanceof Error ? error : new Error('Failed to load companies'));
    }
  }, [user?.id, getUserCompanies, skipLoadingInOnboarding, setUserCompanies, hookId, setError, getStoredCompany, setSelectedCompany]);
  
  // Load initial data when user is available
  useEffect(() => {
    if (user?.id && !skipLoadingInOnboarding && !initialDataLoaded.current) {
      loadInitialData();
    }
  }, [user?.id, skipLoadingInOnboarding, loadInitialData]);
  
  // Auto-select company when user companies are loaded
  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding) {
      setSelectedCompany(userCompanies[0]);
    }
  }, [userCompanies.length, selectedCompany, skipLoadingInOnboarding, setSelectedCompany]);
  
  // Simplified event listeners
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }
    
    const handleCompanyRelationChange = () => {
      if (user?.id) {
        forceGetUserCompanies(user.id);
      }
    };

    const handleForceReload = () => {
      if (user?.id) {
        forceGetUserCompanies(user.id);
      } else {
        fetchCompanies();
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('force-reload-companies', handleForceReload);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [user?.id, forceGetUserCompanies, fetchCompanies, skipLoadingInOnboarding]);
  
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
