
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

// Cache global para verificação de super_admin (evita múltiplas requisições)
const superAdminCache = new Map<string, { isSuperAdmin: boolean; timestamp: number }>();
const SUPER_ADMIN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const { skipLoadingInOnboarding = false } = options;
  
  // Get global state management
  const { hookId, globalState } = useCompanyGlobalState();
  
  // Get auth context
  const { user } = useAuth();
  const initialDataLoaded = useRef(false);
  const hasRegistered = useRef(false);
  const loadingInProgress = useRef(false);
  
  // Register hook with global state (simplificado)
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
    incrementFetchCount
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
    getStoredCompany
  } = useCompanySelection({ 
    setSelectedCompany 
  });
  
  const { updateCompany } = useCompanyUpdate({ 
    setIsLoading, 
    setCompanies,
    setUserCompanies, 
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

  // Função otimizada para verificar super_admin (com cache global)
  const checkSuperAdmin = useCallback(async (userId: string): Promise<boolean> => {
    const cached = superAdminCache.get(userId);
    const now = Date.now();
    
    // Retornar do cache se ainda válido
    if (cached && (now - cached.timestamp) < SUPER_ADMIN_CACHE_DURATION) {
      return cached.isSuperAdmin;
    }
    
    // Verificar localStorage primeiro
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        const isSuperAdmin = profile.super_admin === true;
        superAdminCache.set(userId, { isSuperAdmin, timestamp: now });
        return isSuperAdmin;
      }
    } catch (e) {
      // Ignorar erro de parse
    }
    
    // Buscar do banco apenas se necessário
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        if (profileError.code === '42P17') {
          // RLS error - assumir não é super admin
          const isSuperAdmin = false;
          superAdminCache.set(userId, { isSuperAdmin, timestamp: now });
          localStorage.setItem(`profile_${userId}`, JSON.stringify({ super_admin: false }));
          return isSuperAdmin;
        }
        return false;
      }
      
      const isSuperAdmin = profileData?.super_admin === true;
      superAdminCache.set(userId, { isSuperAdmin, timestamp: now });
      if (profileData) {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
      }
      return isSuperAdmin;
    } catch (error) {
      console.error('[useCompanies] Error checking super admin:', error);
      return false;
    }
  }, []);

  // Carregamento inicial simplificado
  const loadInitialData = useCallback(async () => {
    if (skipLoadingInOnboarding || !user?.id || initialDataLoaded.current || loadingInProgress.current) {
      return;
    }
    
    loadingInProgress.current = true;
    
    try {
      // Tentar recuperar empresa armazenada primeiro
      const storedCompany = getStoredCompany();
      if (storedCompany) {
        setSelectedCompany(storedCompany);
      }
      
      // Verificar se é super admin (com cache)
      const isSuperAdmin = await checkSuperAdmin(user.id);
      
      // Usar cache key baseado no tipo de usuário
      const cacheKey = isSuperAdmin ? 'super_admin_companies' : `user_companies_${user.id}`;
      
      // Verificar cache imediato
      const cachedData = getImmediateCache(cacheKey);
      if (cachedData && cachedData.length > 0) {
        setUserCompanies(cachedData);
        initialDataLoaded.current = true;
        return;
      }
      
      setIsLoading(true);
      
      // Fetcher baseado no tipo de usuário
      const fetcher = async () => {
        if (isSuperAdmin) {
          const { data: allCompanies, error: companiesError } = await supabase
            .from('empresas')
            .select('*')
            .order('nome')
            .limit(20);
          
          if (companiesError) throw companiesError;
          return allCompanies || [];
        } else {
          return await getUserCompanies(user.id);
        }
      };
      
      // Usar cache global
      const companies = await getCachedCompanies(cacheKey, fetcher);
      setUserCompanies(companies);
      initialDataLoaded.current = true;
      
    } catch (error) {
      console.error(`[useCompanies] Error loading initial data:`, error);
      setError(error instanceof Error ? error : new Error('Failed to load companies'));
    } finally {
      setIsLoading(false);
      loadingInProgress.current = false;
    }
  }, [skipLoadingInOnboarding, user?.id, getStoredCompany, setSelectedCompany, checkSuperAdmin, getImmediateCache, setUserCompanies, setIsLoading, getCachedCompanies, getUserCompanies, setError]);
  
  // Carregar dados iniciais quando usuário estiver disponível (simplificado)
  useEffect(() => {
    if (user?.id && !skipLoadingInOnboarding && !initialDataLoaded.current) {
      loadInitialData();
    }
  }, [user?.id, skipLoadingInOnboarding, loadInitialData]);
  
  // Auto-selecionar empresa quando empresas do usuário forem carregadas
  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany && !skipLoadingInOnboarding) {
      const storedCompany = getStoredCompany();
      const companyToSelect = storedCompany || userCompanies[0];
      setSelectedCompany(companyToSelect);
    }
  }, [userCompanies.length, selectedCompany, skipLoadingInOnboarding, getStoredCompany, setSelectedCompany]);

  // Event listeners simplificados
  useEffect(() => {
    if (skipLoadingInOnboarding || !user?.id) {
      return;
    }
    
    const handleCompanyRelationChange = () => {
      const cacheKey = `user_companies_${user.id}`;
      invalidateCache(cacheKey);
      invalidateCache('super_admin_companies');
      initialDataLoaded.current = false;
      loadInitialData();
    };

    const handleForceReload = () => {
      invalidateCache();
      superAdminCache.delete(user.id);
      initialDataLoaded.current = false;
      loadInitialData();
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('force-reload-companies', handleForceReload);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [user?.id, skipLoadingInOnboarding, invalidateCache, loadInitialData]);

  // Enhanced forceGetUserCompanies com invalidação de cache
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
