
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
  
  console.log(`[useCompanies-${hookId}] Hook called`, {
    userId: user?.id || 'no user',
    skipLoadingInOnboarding,
    initialDataLoaded: initialDataLoaded.current
  });
  
  // Register hook with global state
  useEffect(() => {
    if (!hasRegistered.current) {
      globalState.registerHook(hookId);
      hasRegistered.current = true;
      console.log(`[useCompanies-${hookId}] Hook registered`);
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
  
  console.log(`[useCompanies-${hookId}] Current state:`, {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoading
  });
  
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
  
  // Load initial data only when needed - simplified version
  const loadInitialData = useCallback(async () => {
    if (skipLoadingInOnboarding || !user?.id || initialDataLoaded.current || isLoading) {
      return;
    }
    
    try {
      initialDataLoaded.current = true;
      console.log(`[useCompanies-${hookId}] Loading initial company data`);
      
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
        console.log(`[useCompanies-${hookId}] Loaded all companies for super admin`);
      } else {
        await getUserCompanies(user.id);
        console.log(`[useCompanies-${hookId}] Loaded user companies`);
      }
      
    } catch (error) {
      console.error(`[useCompanies-${hookId}] Error loading initial company data:`, error);
      setError(error instanceof Error ? error : new Error('Failed to load companies'));
    }
  }, [user?.id, isLoading, getUserCompanies, skipLoadingInOnboarding, setUserCompanies, hookId, setError]);
  
  // Load initial data when user is available
  useEffect(() => {
    if (user?.id && !skipLoadingInOnboarding && !initialDataLoaded.current) {
      const timer = setTimeout(() => {
        loadInitialData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, skipLoadingInOnboarding, loadInitialData]);
  
  // Auto-select company when user companies are loaded
  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding) {
      console.log(`[useCompanies-${hookId}] Auto-selecting first company:`, userCompanies[0].nome);
      setSelectedCompany(userCompanies[0]);
    }
  }, [userCompanies.length, selectedCompany, skipLoadingInOnboarding, setSelectedCompany, hookId]);
  
  // Simple event listeners
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }
    
    const handleCompanyRelationChange = () => {
      if (user?.id) {
        console.log(`[useCompanies-${hookId}] Company relation changed, reloading companies`);
        forceGetUserCompanies(user.id);
      }
    };

    const handleForceReload = () => {
      if (user?.id) {
        console.log(`[useCompanies-${hookId}] Forcing company reload`);
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
  }, [user?.id, forceGetUserCompanies, fetchCompanies, skipLoadingInOnboarding, hookId]);
  
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
