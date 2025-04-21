import { useEffect, useCallback, useRef } from "react";
import { useCompanyState } from "./company/useCompanyState";
import { useCompanyFetching } from "./company/useCompanyFetching";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
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
    setCompanies 
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
  
  // Carregamento de dados global com memoização do callback para reduzir recriações
  const loadInitialData = useCallback(async () => {
    // Se já carregamos os dados iniciais, não carregue novamente
    if (initialDataLoaded.current) {
      return;
    }
    
    // IMPORTANTE: Verificar se devemos pular o carregamento durante onboarding
    if (skipLoadingInOnboarding) {
      console.log("[useCompanies] Pulando carregamento de empresas durante onboarding");
      return;
    }
    
    if (!user?.id) {
      return;
    }
    
    // Se já estamos carregando, não inicie outra requisição
    if (isLoading) {
      return;
    }
    
    try {
      initialDataLoaded.current = true;
      console.log("[useCompanies] Carregando dados iniciais de empresas");
      
      // Verificar se o usuário já está no cache antes de buscar
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const companies = JSON.parse(cachedData);
          if (Array.isArray(companies) && companies.length > 0) {
            setUserCompanies(companies);
            console.log("[useCompanies] Usando dados em cache durante carregamento inicial");
            
            // Iniciar uma busca em segundo plano, sem mostrar loading
            getUserCompanies(user.id, false).catch(err => 
              console.error('[useCompanies] Erro ao atualizar dados de empresas em background:', err)
            );
            return;
          }
        } catch (e) {
          console.error('[useCompanies] Erro ao analisar cache de empresas:', e);
        }
      }
      
      // Verificar se é super admin (uma única vez)
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
      console.error('[useCompanies] Erro ao carregar dados iniciais de empresas:', error);
    }
  }, [user?.id, isLoading, getUserCompanies, skipLoadingInOnboarding, setUserCompanies]);
  
  // Atualizar dados quando necessário (with better memoization)
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanies] Forçando atualização após mudança de relação de empresa');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanies] Erro ao atualizar empresas após mudança de relação:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies]);

  const handleForceReload = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanies] Forçando recarregamento de empresas por solicitação do usuário');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanies] Erro ao forçar recarregamento de empresas:', error);
      }
    } else {
      try {
        console.log('[useCompanies] Forçando recarregamento de todas as empresas por solicitação do usuário');
        await fetchCompanies();
      } catch (error) {
        console.error('[useCompanies] Erro ao forçar recarregamento de todas as empresas:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);
  
  // Wrap forceGetUserCompanies to ensure it matches the expected interface
  const wrappedForceGetUserCompanies = useCallback(async (userId: string): Promise<any> => {
    return await forceGetUserCompanies(userId);
  }, [forceGetUserCompanies]);
  
  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    fetchCompanies,
    getUserCompanies,
    forceGetUserCompanies: wrappedForceGetUserCompanies,
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
