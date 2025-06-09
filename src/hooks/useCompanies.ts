
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
import { Company } from "@/types/company";

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
  
  // Clear cached company data on user change
  useEffect(() => {
    if (user?.id) {
      // This is a user change or initial login
      const checkUserChange = async () => {
        // Reset data for new user
        initialDataLoaded.current = false;
        
        // Clear cache if we already have data loaded (which means this is a user change)
        if (userCompanies.length > 0) {
          localStorage.removeItem('userCompanies');
          localStorage.removeItem('selectedCompany');
          localStorage.removeItem('selectedCompanyId');
          setUserCompanies([]);
          setSelectedCompany(null);
        }
      };
      
      checkUserChange();
    }
  }, [user?.id, setUserCompanies, setSelectedCompany]);
  
  // Global data loading with improved throttling
  const loadInitialData = useCallback(async () => {
    // If we've already loaded initial data, don't load again
    if (initialDataLoaded.current) {
      console.log(`[${hookId}] Initial data already loaded, skipping`);
      return;
    }
    
    // IMPORTANT: Check if we should skip loading during onboarding
    if (skipLoadingInOnboarding) {
      console.log(`[${hookId}] Skipping company loading during onboarding`);
      return;
    }
    
    if (!user?.id) {
      console.log(`[${hookId}] No user ID, skipping initialization`);
      return;
    }
    
    // Check global state to prevent multiple initializations
    if (!globalState.canInitialize(hookId)) {
      console.log(`[${hookId}] Global state prevents initialization`);
      return;
    }
    
    // If we're already loading, don't start another request
    if (isLoading) {
      console.log(`[${hookId}] Already loading, skipping initialization`);
      return;
    }
    
    try {
      globalState.startInitialization(hookId);
      initialDataLoaded.current = true;
      
      console.log(`[${hookId}] Starting company data initialization`);
      
      // Check if user companies are already cached before fetching
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const companies = JSON.parse(cachedData);
          if (Array.isArray(companies) && companies.length > 0) {
            setUserCompanies(companies);
            console.log(`[${hookId}] Using cached data during initial load`);
            
            // Start a background fetch without showing loading
            getUserCompanies(user.id, false).catch(err => 
              console.error(`[${hookId}] Error updating company data in background:`, err)
            );
            return;
          }
        } catch (e) {
          console.error(`[${hookId}] Error parsing company cache:`, e);
        }
      }
      
      // Check if user is super admin (once)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', user.id)
        .single();
      
      if (profileData?.super_admin) {
        const { data: allCompanies } = await supabase
          .from('empresas')
          .select('*');
        
        setUserCompanies(allCompanies as Company[] || []);
      } else {
        await getUserCompanies(user.id);
      }
    } catch (error) {
      console.error(`[${hookId}] Error loading initial company data:`, error);
    } finally {
      globalState.endInitialization(hookId);
    }
  }, [user?.id, isLoading, getUserCompanies, skipLoadingInOnboarding, setUserCompanies, hookId, globalState]);
  
  // Load initial data only when needed
  useEffect(() => {
    // IMPORTANT: Check skipLoadingInOnboarding option before loading data
    if (user?.id && !initialDataLoaded.current && !skipLoadingInOnboarding) {
      // Add a small delay to prevent immediate execution
      const timer = setTimeout(() => {
        if (!initialDataLoaded.current && globalState.canInitialize(hookId)) {
          loadInitialData();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loadInitialData, user?.id, skipLoadingInOnboarding, hookId, globalState]);
  
  // Update data when needed (with better memoization)
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id && !globalState.isInitializing) {
      try {
        console.log(`[${hookId}] Forcing update after company relation change`);
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error(`[${hookId}] Error updating companies after relation change:`, error);
      }
    }
  }, [user?.id, forceGetUserCompanies, hookId, globalState]);

  const handleForceReload = useCallback(async () => {
    if (globalState.isInitializing) {
      console.log(`[${hookId}] Skipping force reload - initialization in progress`);
      return;
    }
    
    if (user?.id) {
      try {
        console.log(`[${hookId}] Forcing company reload at user request`);
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error(`[${hookId}] Error forcing company reload:`, error);
      }
    } else {
      try {
        console.log(`[${hookId}] Forcing all companies reload at user request`);
        await fetchCompanies();
      } catch (error) {
        console.error(`[${hookId}] Error forcing all companies reload:`, error);
      }
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies, hookId, globalState]);
  
  // Set up listeners only once
  useEffect(() => {
    // IMPORTANT: Don't set up listeners if we're in onboarding mode
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
  
  // Restore previously selected company (memoized to avoid recreations)
  const restoreSelectedCompany = useCallback(async () => {
    // IMPORTANT: Don't restore company if we're in onboarding mode
    if (skipLoadingInOnboarding) {
      return;
    }
    
    // Skip if we already have a selected company
    if (selectedCompany) return;
    
    // Don't restore during global initialization
    if (globalState.isInitializing) {
      console.log(`[${hookId}] Skipping company restoration - global init in progress`);
      return;
    }
    
    // First try to get complete company object from localStorage
    const cachedCompany = getStoredCompany();
    if (cachedCompany) {
      // Check if user has access to this company
      const hasAccess = userCompanies.some(company => company.id === cachedCompany.id);
      
      if (hasAccess) {
        console.log(`[${hookId}] Restored selected company from cache:`, cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      } else {
        console.log(`[${hookId}] User does not have access to cached company, selecting another`);
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
      }
    }
    
    // If we have user companies but no selected company yet
    if (userCompanies.length > 0) {
      const storedCompanyId = getStoredCompanyId();
      
      if (storedCompanyId) {
        // Try to find in already loaded user companies
        const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
        
        if (storedCompany) {
          setSelectedCompany(storedCompany);
          console.log(`[${hookId}] Restored selected company from localStorage ID:`, storedCompany.nome);
        } else {
          // If not found, try to fetch
          try {
            const company = await getCompanyById(storedCompanyId);
            if (company) {
              // Check if user has access to this company
              const hasAccess = userCompanies.some(c => c.id === company.id);
              
              if (hasAccess) {
                setSelectedCompany(company);
                console.log(`[${hookId}] Restored selected company from database:`, company.nome);
              } else {
                localStorage.removeItem('selectedCompanyId');
                // Select first available company
                setSelectedCompany(userCompanies[0]);
                console.log(`[${hookId}] Selected first available company after access check:`, userCompanies[0].nome);
              }
            } else {
              // If not found, select first company
              localStorage.removeItem('selectedCompanyId');
              setSelectedCompany(userCompanies[0]);
              console.log(`[${hookId}] Selected first available company after fetch:`, userCompanies[0].nome);
            }
          } catch (error) {
            console.error(`[${hookId}] Failed to restore company from localStorage`, error);
            localStorage.removeItem('selectedCompanyId');
            
            // If failed and we have user companies, select first
            if (userCompanies.length > 0) {
              setSelectedCompany(userCompanies[0]);
              console.log(`[${hookId}] Selected first available company after failure:`, userCompanies[0].nome);
            }
          }
        }
      } else if (userCompanies.length === 1) {
        // Automatically select the only company
        setSelectedCompany(userCompanies[0]);
        console.log(`[${hookId}] Auto-selected only available company:`, userCompanies[0].nome);
      }
    }
  }, [
    userCompanies, 
    selectedCompany, 
    getCompanyById, 
    getStoredCompanyId, 
    getStoredCompany, 
    setSelectedCompany, 
    skipLoadingInOnboarding,
    hookId,
    globalState
  ]);

  // Restore company only when needed
  useEffect(() => {
    // IMPORTANT: Don't restore company if we're in onboarding mode
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding && !globalState.isInitializing) {
      // Add delay to prevent immediate execution
      const timer = setTimeout(() => {
        if (!selectedCompany && !globalState.isInitializing) {
          restoreSelectedCompany();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userCompanies.length, selectedCompany, restoreSelectedCompany, skipLoadingInOnboarding, globalState]);
  
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
