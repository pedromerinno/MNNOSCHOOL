import { useEffect } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyEvents } from "./company/useCompanyEvents";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

interface UseCompaniesOptions {
  skipLoadingInOnboarding?: boolean;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  
  const { user } = useAuth();
  
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
  
  const { 
    fetchCompanies,
    selectCompany,
    getStoredCompanyId,
    getStoredCompany 
  } = useCompanySelection({ 
    setSelectedCompany 
  });
  
  const { createCompany } = useCompanyCreate({ 
    setIsLoading, 
    setCompanies 
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
  
  useCompanyEvents(setSelectedCompany);
  
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      console.log("[useCompanies] Pulando carregamento de empresas durante onboarding");
      return;
    }
    
    const loadInitialData = async () => {
      if (user?.id && !isLoading) {
        try {
          const cachedCompany = getStoredCompany();
          if (cachedCompany) {
            console.log('[useCompanies] Using cached company while loading:', cachedCompany.nome);
            setSelectedCompany(cachedCompany);
          }
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('super_admin')
            .eq('id', user.id)
            .single();
          
          if (profileData?.super_admin) {
            const { data: allCompanies } = await supabase
              .from('empresas')
              .select('*')
              .order('nome');
            
            setUserCompanies(allCompanies as Company[] || []);
            
            if (!cachedCompany && allCompanies && allCompanies.length > 0) {
              selectCompany(user.id, allCompanies[0]);
            }
          } else {
            const companies = await getUserCompanies(user.id);
            if (!cachedCompany && companies && companies.length > 0) {
              selectCompany(user.id, companies[0]);
            }
          }
        } catch (error) {
          console.error('[useCompanies] Error loading initial company data:', error);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, isLoading, getUserCompanies, getStoredCompany, selectCompany, skipLoadingInOnboarding]);
  
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }
    
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        try {
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Error refreshing companies after relation change:', error);
        }
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    const handleForceReload = async () => {
      if (user?.id) {
        try {
          console.log('[useCompanies] Force reloading companies due to user request');
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Error force reloading companies:', error);
        }
      } else {
        try {
          console.log('[useCompanies] Force reloading all companies due to user request');
          await fetchCompanies();
        } catch (error) {
          console.error('[useCompanies] Error force reloading all companies:', error);
        }
      }
    };
    
    window.addEventListener('force-reload-companies', handleForceReload);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [user?.id, forceGetUserCompanies, fetchCompanies, skipLoadingInOnboarding]);
  
  useEffect(() => {
    if (skipLoadingInOnboarding) {
      return;
    }
    
    const restoreSelectedCompany = async () => {
      if (selectedCompany) return;
      
      const cachedCompany = getStoredCompany();
      if (cachedCompany) {
        console.log('[useCompanies] Restored selected company from cache:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      }
      
      if (userCompanies.length > 0) {
        const storedCompanyId = getStoredCompanyId();
        
        if (storedCompanyId) {
          const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
          
          if (storedCompany) {
            setSelectedCompany(storedCompany);
            console.log('[useCompanies] Restored selected company from userCompanies:', storedCompany.nome);
          } else {
            try {
              const company = await getCompanyById(storedCompanyId);
              if (company) {
                setSelectedCompany(company);
                console.log('[useCompanies] Restored selected company from database:', company.nome);
              }
            } catch (error) {
              console.error('[useCompanies] Failed to restore company from localStorage', error);
              localStorage.removeItem('selectedCompanyId');
              
              if (userCompanies.length > 0) {
                setSelectedCompany(userCompanies[0]);
                console.log('[useCompanies] Selected first available company after fetch failure:', userCompanies[0].nome);
              }
            }
          }
        } else if (userCompanies.length === 1) {
          setSelectedCompany(userCompanies[0]);
          console.log('[useCompanies] Auto-selected the only available company:', userCompanies[0].nome);
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId, getStoredCompany, setSelectedCompany, skipLoadingInOnboarding]);
  
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
