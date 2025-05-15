import { useEffect, useCallback, useRef } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreateUpdates";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyEvents } from '@/hooks/company/useCompanyEvents';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  
  // Get auth context for global access
  const { user } = useAuth();
  const initialDataLoaded = useRef(false);
  
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
  
  // Fix: useCompanyEvents should not have an argument
  const selectedCompanyFromEvent = useCompanyEvents();
  
  // Use o resultado do hook, se disponível
  useEffect(() => {
    if (selectedCompanyFromEvent) {
      setSelectedCompany(selectedCompanyFromEvent);
    }
  }, [selectedCompanyFromEvent]);
  
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
  
  // Global data loading with memoized callback to reduce recreations
  const loadInitialData = useCallback(async () => {
    // If we've already loaded initial data, don't load again
    if (initialDataLoaded.current) {
      return;
    }
    
    // IMPORTANT: Check if we should skip loading during onboarding
    if (skipLoadingInOnboarding) {
      console.log("[useCompanies] Skipping company loading during onboarding");
      return;
    }
    
    if (!user?.id) {
      return;
    }
    
    // If we're already loading, don't start another request
    if (isLoading) {
      return;
    }
    
    try {
      initialDataLoaded.current = true;
      console.log("[useCompanies] Loading initial company data");
      
      // Check if user companies are already cached before fetching
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const companies = JSON.parse(cachedData);
          if (Array.isArray(companies) && companies.length > 0) {
            setUserCompanies(companies);
            console.log("[useCompanies] Using cached data during initial load");
            
            // Start a background fetch without showing loading
            getUserCompanies(user.id, false).catch(err => 
              console.error('[useCompanies] Error updating company data in background:', err)
            );
            return;
          }
        } catch (e) {
          console.error('[useCompanies] Error parsing company cache:', e);
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
      console.error('[useCompanies] Error loading initial company data:', error);
    }
  }, [user?.id, isLoading, getUserCompanies, skipLoadingInOnboarding, setUserCompanies]);
  
  // Load initial data only when needed
  useEffect(() => {
    // IMPORTANT: Check skipLoadingInOnboarding option before loading data
    if (user?.id && !initialDataLoaded.current && !skipLoadingInOnboarding) {
      loadInitialData();
    }
  }, [loadInitialData, user?.id, skipLoadingInOnboarding]);
  
  // Update data when needed (with better memoization)
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanies] Forcing update after company relation change');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanies] Error updating companies after relation change:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies]);

  const handleForceReload = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanies] Forcing company reload at user request');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanies] Error forcing company reload:', error);
      }
    } else {
      try {
        console.log('[useCompanies] Forcing all companies reload at user request');
        await fetchCompanies();
      } catch (error) {
        console.error('[useCompanies] Error forcing all companies reload:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);
  
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
    
    // First try to get complete company object from localStorage
    const cachedCompany = getStoredCompany();
    if (cachedCompany) {
      // Check if user has access to this company
      const hasAccess = userCompanies.some(company => company.id === cachedCompany.id);
      
      if (hasAccess) {
        console.log('[useCompanies] Restored selected company from cache:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      } else {
        console.log('[useCompanies] User does not have access to cached company, selecting another');
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
          console.log('[useCompanies] Restored selected company from localStorage ID:', storedCompany.nome);
        } else {
          // If not found, try to fetch
          try {
            const company = await getCompanyById(storedCompanyId);
            if (company) {
              // Check if user has access to this company
              const hasAccess = userCompanies.some(c => c.id === company.id);
              
              if (hasAccess) {
                setSelectedCompany(company);
                console.log('[useCompanies] Restored selected company from database:', company.nome);
              } else {
                localStorage.removeItem('selectedCompanyId');
                // Select first available company
                setSelectedCompany(userCompanies[0]);
                console.log('[useCompanies] Selected first available company after access check:', userCompanies[0].nome);
              }
            } else {
              // If not found, select first company
              localStorage.removeItem('selectedCompanyId');
              setSelectedCompany(userCompanies[0]);
              console.log('[useCompanies] Selected first available company after fetch:', userCompanies[0].nome);
            }
          } catch (error) {
            console.error('[useCompanies] Failed to restore company from localStorage', error);
            localStorage.removeItem('selectedCompanyId');
            
            // If failed and we have user companies, select first
            if (userCompanies.length > 0) {
              setSelectedCompany(userCompanies[0]);
              console.log('[useCompanies] Selected first available company after failure:', userCompanies[0].nome);
            }
          }
        }
      } else if (userCompanies.length === 1) {
        // Automatically select the only company
        setSelectedCompany(userCompanies[0]);
        console.log('[useCompanies] Auto-selected only available company:', userCompanies[0].nome);
      }
    }
  }, [
    userCompanies, 
    selectedCompany, 
    getCompanyById, 
    getStoredCompanyId, 
    getStoredCompany, 
    setSelectedCompany, 
    skipLoadingInOnboarding
  ]);

  // Restore company only when needed
  useEffect(() => {
    // IMPORTANT: Don't restore company if we're in onboarding mode
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding) {
      restoreSelectedCompany();
    }
  }, [userCompanies.length, selectedCompany, restoreSelectedCompany, skipLoadingInOnboarding]);
  
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
