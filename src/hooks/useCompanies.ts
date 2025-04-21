
import { useEffect, useCallback, useRef } from "react";
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
  
  // Carregar dados iniciais apenas quando necessário
  useEffect(() => {
    // IMPORTANTE: Verificar a opção skipLoadingInOnboarding antes de carregar dados
    if (user?.id && !initialDataLoaded.current && !skipLoadingInOnboarding) {
      loadInitialData();
    }
  }, [loadInitialData, user?.id, skipLoadingInOnboarding]);
  
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
  
  // Configurar listeners apenas uma vez
  useEffect(() => {
    // IMPORTANTE: Não configurar listeners se estivermos em modo onboarding
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
  
  // Restaurar empresa selecionada previamente (memoizado para evitar recriações)
  const restoreSelectedCompany = useCallback(async () => {
    // IMPORTANTE: Não restaurar empresa se estivermos em modo onboarding
    if (skipLoadingInOnboarding) {
      return;
    }
    
    // Pular se já temos uma empresa selecionada
    if (selectedCompany) return;
    
    // Primeiro tentar obter o objeto completo de empresa do localStorage
    const cachedCompany = getStoredCompany();
    if (cachedCompany) {
      // Verificar se o usuário tem acesso a esta empresa
      const hasAccess = userCompanies.some(company => company.id === cachedCompany.id);
      
      if (hasAccess) {
        console.log('[useCompanies] Empresa selecionada restaurada do cache:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      } else {
        console.log('[useCompanies] Usuário não tem acesso à empresa em cache, selecionando outra');
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
      }
    }
    
    // Se temos empresas de usuário mas nenhuma selecionada ainda
    if (userCompanies.length > 0) {
      const storedCompanyId = getStoredCompanyId();
      
      if (storedCompanyId) {
        // Tentar encontrar nas empresas de usuário já carregadas
        const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
        
        if (storedCompany) {
          setSelectedCompany(storedCompany);
          console.log('[useCompanies] Empresa selecionada restaurada do ID no localStorage:', storedCompany.nome);
        } else {
          // Se não encontrada, tentar buscar
          try {
            const company = await getCompanyById(storedCompanyId);
            if (company) {
              // Verificar se o usuário tem acesso a esta empresa
              const hasAccess = userCompanies.some(c => c.id === company.id);
              
              if (hasAccess) {
                setSelectedCompany(company);
                console.log('[useCompanies] Empresa selecionada restaurada do banco de dados:', company.nome);
              } else {
                localStorage.removeItem('selectedCompanyId');
                // Selecionar a primeira empresa disponível
                setSelectedCompany(userCompanies[0]);
                console.log('[useCompanies] Selecionando primeira empresa disponível após verificação de acesso:', userCompanies[0].nome);
              }
            } else {
              // Se não encontrada, selecionar a primeira empresa
              localStorage.removeItem('selectedCompanyId');
              setSelectedCompany(userCompanies[0]);
              console.log('[useCompanies] Primeira empresa disponível selecionada após busca:', userCompanies[0].nome);
            }
          } catch (error) {
            console.error('[useCompanies] Falha ao restaurar empresa do localStorage', error);
            localStorage.removeItem('selectedCompanyId');
            
            // Se falhar e tivermos empresas de usuário, selecionar a primeira
            if (userCompanies.length > 0) {
              setSelectedCompany(userCompanies[0]);
              console.log('[useCompanies] Primeira empresa disponível selecionada após falha:', userCompanies[0].nome);
            }
          }
        }
      } else if (userCompanies.length === 1) {
        // Selecionar automaticamente a única empresa
        setSelectedCompany(userCompanies[0]);
        console.log('[useCompanies] Única empresa disponível selecionada automaticamente:', userCompanies[0].nome);
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

  // Restaurar empresa apenas quando necessário
  useEffect(() => {
    // IMPORTANTE: Não restaurar empresa se estivermos em modo onboarding
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
