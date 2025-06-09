
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
  const restorationAttempted = useRef(false);
  
  console.log(`[useCompanies-${hookId}] Hook called`, {
    userId: user?.id || 'no user',
    skipLoadingInOnboarding
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
  
  // IMMEDIATE company restoration on hook initialization
  useEffect(() => {
    if (!skipLoadingInOnboarding && !selectedCompany && !restorationAttempted.current) {
      console.log(`[useCompanies-${hookId}] 🔄 Attempting immediate company restoration from localStorage...`);
      restorationAttempted.current = true;
      
      const cachedCompany = getStoredCompany();
      if (cachedCompany) {
        console.log(`[useCompanies-${hookId}] ✅ Immediately restored company from localStorage:`, cachedCompany.nome);
        setSelectedCompany(cachedCompany);
      } else {
        const storedId = getStoredCompanyId();
        if (storedId) {
          console.log(`[useCompanies-${hookId}] Found stored company ID, will restore after user companies load:`, storedId);
        }
      }
    }
  }, [skipLoadingInOnboarding, selectedCompany, getStoredCompany, getStoredCompanyId, setSelectedCompany, hookId]);
  
  // Clear cached company data on user change
  useEffect(() => {
    if (user?.id) {
      // This is a user change or initial login
      const checkUserChange = async () => {
        // Reset data for new user
        initialDataLoaded.current = false;
        restorationAttempted.current = false;
        
        // Clear cache if we already have data loaded (which means this is a user change)
        if (userCompanies.length > 0) {
          localStorage.removeItem('userCompanies');
          localStorage.removeItem('selectedCompany');
          localStorage.removeItem('selectedCompanyId');
          setUserCompanies([]);
          setSelectedCompany(null);
          console.log(`[useCompanies-${hookId}] User changed - cleared cache`);
        }
      };
      
      checkUserChange();
    }
  }, [user?.id, setUserCompanies, setSelectedCompany, hookId]);
  
  // Global data loading with improved throttling
  const loadInitialData = useCallback(async () => {
    // If we've already loaded initial data, don't load again
    if (initialDataLoaded.current) {
      console.log(`[useCompanies-${hookId}] Initial data already loaded, skipping`);
      return;
    }
    
    // IMPORTANT: Check if we should skip loading during onboarding
    if (skipLoadingInOnboarding) {
      console.log(`[useCompanies-${hookId}] Skipping company loading during onboarding`);
      return;
    }
    
    if (!user?.id) {
      console.log(`[useCompanies-${hookId}] No user ID, skipping initialization`);
      return;
    }
    
    // Check global state to prevent multiple initializations
    if (!globalState.canInitialize(hookId)) {
      console.log(`[useCompanies-${hookId}] Global state prevents initialization`);
      return;
    }
    
    // If we're already loading, don't start another request
    if (isLoading) {
      console.log(`[useCompanies-${hookId}] Already loading, skipping initialization`);
      return;
    }
    
    try {
      globalState.startInitialization(hookId);
      initialDataLoaded.current = true;
      
      console.log(`[useCompanies-${hookId}] 🚀 Starting company data initialization`);
      
      // Check if user companies are already cached before fetching
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const companies = JSON.parse(cachedData);
          if (Array.isArray(companies) && companies.length > 0) {
            setUserCompanies(companies);
            console.log(`[useCompanies-${hookId}] ✅ Using cached data during initial load`);
            
            // Start a background fetch without showing loading
            getUserCompanies(user.id, false).catch(err => 
              console.error(`[useCompanies-${hookId}] Error updating company data in background:`, err)
            );
            return;
          }
        } catch (e) {
          console.error(`[useCompanies-${hookId}] Error parsing company cache:`, e);
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
        console.log(`[useCompanies-${hookId}] ✅ Loaded all companies for super admin`);
      } else {
        await getUserCompanies(user.id);
        console.log(`[useCompanies-${hookId}] ✅ Loaded user companies`);
      }
    } catch (error) {
      console.error(`[useCompanies-${hookId}] ❌ Error loading initial company data:`, error);
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
  
  // Restore company when user companies are loaded (if not already restored)
  const restoreSelectedCompany = useCallback(async () => {
    // Don't restore if we're in onboarding mode
    if (skipLoadingInOnboarding) {
      return;
    }
    
    // Skip if we already have a selected company
    if (selectedCompany) {
      console.log(`[useCompanies-${hookId}] Already have selected company:`, selectedCompany.nome);
      return;
    }
    
    // Don't restore during global initialization
    if (globalState.isInitializing) {
      console.log(`[useCompanies-${hookId}] Skipping company restoration - global init in progress`);
      return;
    }
    
    // Don't restore if no user companies yet
    if (userCompanies.length === 0) {
      console.log(`[useCompanies-${hookId}] No user companies yet for restoration`);
      return;
    }
    
    console.log(`[useCompanies-${hookId}] 🔄 Attempting company restoration with user companies...`);
    
    // Try stored ID from localStorage
    const storedCompanyId = getStoredCompanyId();
    if (storedCompanyId) {
      // Try to find in already loaded user companies
      const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
      
      if (storedCompany) {
        setSelectedCompany(storedCompany);
        console.log(`[useCompanies-${hookId}] ✅ Restored selected company from user companies:`, storedCompany.nome);
        return;
      } else {
        // If not found, try to fetch
        try {
          const company = await getCompanyById(storedCompanyId);
          if (company) {
            // Check if user has access to this company
            const hasAccess = userCompanies.some(c => c.id === company.id);
            
            if (hasAccess) {
              setSelectedCompany(company);
              console.log(`[useCompanies-${hookId}] ✅ Restored selected company from database:`, company.nome);
              return;
            } else {
              localStorage.removeItem('selectedCompanyId');
              localStorage.removeItem('selectedCompany');
              console.log(`[useCompanies-${hookId}] ⚠️ No access to fetched company, will select first available`);
            }
          } else {
            localStorage.removeItem('selectedCompanyId');
            localStorage.removeItem('selectedCompany');
            console.log(`[useCompanies-${hookId}] ⚠️ Company not found, will select first available`);
          }
        } catch (error) {
          console.error(`[useCompanies-${hookId}] ❌ Failed to restore company from localStorage`, error);
          localStorage.removeItem('selectedCompanyId');
          localStorage.removeItem('selectedCompany');
        }
      }
    }
    
    // If all else fails and we have user companies, select first
    if (userCompanies.length > 0) {
      setSelectedCompany(userCompanies[0]);
      console.log(`[useCompanies-${hookId}] ✅ Auto-selected first available company:`, userCompanies[0].nome);
    }
  }, [
    userCompanies, 
    selectedCompany, 
    getCompanyById, 
    getStoredCompanyId, 
    setSelectedCompany, 
    skipLoadingInOnboarding,
    hookId,
    globalState
  ]);

  // Restore company when user companies are loaded (if not already restored)
  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding && !globalState.isInitializing) {
      console.log(`[useCompanies-${hookId}] User companies loaded, attempting restoration...`);
      // Add delay to prevent immediate execution
      const timer = setTimeout(() => {
        if (!selectedCompany && !globalState.isInitializing) {
          restoreSelectedCompany();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userCompanies.length, selectedCompany, restoreSelectedCompany, skipLoadingInOnboarding, globalState, hookId]);
  
  // Update data when needed (with better memoization)
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id && !globalState.isInitializing) {
      try {
        console.log(`[useCompanies-${hookId}] Forcing update after company relation change`);
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error(`[useCompanies-${hookId}] Error updating companies after relation change:`, error);
      }
    }
  }, [user?.id, forceGetUserCompanies, hookId, globalState]);

  const handleForceReload = useCallback(async () => {
    if (globalState.isInitializing) {
      console.log(`[useCompanies-${hookId}] Skipping force reload - initialization in progress`);
      return;
    }
    
    if (user?.id) {
      try {
        console.log(`[useCompanies-${hookId}] Forcing company reload at user request`);
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error(`[useCompanies-${hookId}] Error forcing company reload:`, error);
      }
    } else {
      try {
        console.log(`[useCompanies-${hookId}] Forcing all companies reload at user request`);
        await fetchCompanies();
      } catch (error) {
        console.error(`[useCompanies-${hookId}] Error forcing all companies reload:`, error);
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
