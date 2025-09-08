
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
import { useCompanyGlobalCache } from "./company/useCompanyGlobalCache";
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
  
  // Get global cache
  const { getCachedCompanies, getImmediateCache, invalidateCache } = useCompanyGlobalCache();

  // Listen for company selection events
  useCompanyEvents(setSelectedCompany);
  
  // Optimized data loading with global cache
  const loadInitialData = useCallback(async () => {
    if (skipLoadingInOnboarding || !user?.id || initialDataLoaded.current) {
      return;
    }
    
    try {
      console.log('[useCompanies] Loading initial company data for user:', user.id);
      initialDataLoaded.current = true;
      
      // Try to get stored company first for immediate UI update
      const storedCompany = getStoredCompany();
      if (storedCompany) {
        setSelectedCompany(storedCompany);
      }
      
      // Check if user is super admin (cached check first)
      const cachedProfile = localStorage.getItem(`profile_${user.id}`);
      let isSuperAdmin = false;
      
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile);
          isSuperAdmin = profile.super_admin === true;
        } catch (e) {
          // Fallback to DB check
        }
      }
      
      if (!cachedProfile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('super_admin')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
          isSuperAdmin = profileData.super_admin === true;
        }
      }
      
      // Use cache key based on user type
      const cacheKey = isSuperAdmin ? 'super_admin_companies' : `user_companies_${user.id}`;
      
      // Check for immediate cache first
      const cachedData = getImmediateCache(cacheKey);
      if (cachedData && cachedData.length > 0) {
        console.log('[useCompanies] Using cached data:', cachedData.length);
        setUserCompanies(cachedData);
        return;
      }
      
      setIsLoading(true);
      
      // Define fetcher based on user type
      const fetcher = async () => {
        if (isSuperAdmin) {
          const { data: allCompanies, error: companiesError } = await supabase
            .from('empresas')
            .select('*')
            .order('nome')
            .limit(20);
          
          if (companiesError) {
            throw companiesError;
          }
          
          console.log('[useCompanies] Super admin companies fetched:', allCompanies?.length || 0);
          return allCompanies || [];
        } else {
          const companies = await getUserCompanies(user.id);
          console.log('[useCompanies] Regular user companies fetched:', companies.length);
          return companies;
        }
      };
      
      // Use cached fetcher
      const companies = await getCachedCompanies(cacheKey, fetcher);
      setUserCompanies(companies);
      
    } catch (error) {
      console.error(`[useCompanies-${hookId}] Error loading initial company data:`, error);
      setError(error instanceof Error ? error : new Error('Failed to load companies'));
    } finally {
      setIsLoading(false);
    }
  }, [
    user?.id, 
    getUserCompanies, 
    skipLoadingInOnboarding, 
    setUserCompanies, 
    hookId, 
    setError, 
    getStoredCompany, 
    setSelectedCompany,
    getCachedCompanies,
    getImmediateCache,
    setIsLoading
  ]);
  
  // Load initial data when user is available
  useEffect(() => {
    if (user?.id && !skipLoadingInOnboarding && !initialDataLoaded.current) {
      loadInitialData();
    }
  }, [user?.id, skipLoadingInOnboarding, loadInitialData]);
  
  // Auto-select company when user companies are loaded (only if no company selected)
  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding) {
      const storedCompany = getStoredCompany();
      const companyToSelect = storedCompany || userCompanies[0];
      setSelectedCompany(companyToSelect);
      console.log('[useCompanies] Auto-selected company:', companyToSelect.nome);
    }
  }, [userCompanies.length, selectedCompany, skipLoadingInOnboarding, setSelectedCompany, getStoredCompany]);
  
  // Simplified event listeners with cache integration
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }
    
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        console.log('[useCompanies] Company relation changed, invalidating cache...');
        const cacheKey = `user_companies_${user.id}`;
        invalidateCache(cacheKey);
        invalidateCache('super_admin_companies'); // Also invalidate super admin cache
        
        // Reload data
        initialDataLoaded.current = false;
        await loadInitialData();
      }
    };

    const handleForceReload = async () => {
      if (user?.id) {
        console.log('[useCompanies] Force reload requested, invalidating cache');
        invalidateCache(); // Clear all cache
        initialDataLoaded.current = false;
        await loadInitialData();
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
  }, [user?.id, loadInitialData, fetchCompanies, skipLoadingInOnboarding, invalidateCache]);

  // Enhanced forceGetUserCompanies with cache invalidation
  const enhancedForceGetUserCompanies = useCallback(async (userId: string) => {
    const cacheKey = `user_companies_${userId}`;
    invalidateCache(cacheKey);
    return forceGetUserCompanies(userId);
  }, [forceGetUserCompanies, invalidateCache]);
  
  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    fetchCompanies,
    getUserCompanies,
    forceGetUserCompanies: enhancedForceGetUserCompanies,
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
