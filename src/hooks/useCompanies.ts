
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
import { toast } from "sonner";

export const useCompanies = () => {
  // Get auth context for global access
  const { user } = useAuth();
  
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
  const { fetchCompanies } = useCompanyCreate({ 
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
  
  // Listen for company selection events
  useCompanyEvents(setSelectedCompany);
  
  // Global data loading - load user companies only when user is logged in
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading) {
        try {
          console.log('[useCompanies] Carregando empresas do usuário:', user.id);
          await getUserCompanies(user.id);
          
          if (userCompanies.length === 0) {
            console.log('[useCompanies] Nenhuma empresa encontrada para o usuário. Tentando novamente...');
            // Try one more time with force refresh
            await forceGetUserCompanies(user.id);
            
            if (userCompanies.length === 0) {
              console.log('[useCompanies] Ainda sem empresas após segunda tentativa');
            }
          } else {
            console.log('[useCompanies] Empresas carregadas com sucesso:', userCompanies.length);
          }
        } catch (error) {
          console.error('[useCompanies] Erro ao carregar empresas do usuário:', error);
          toast.error("Erro ao carregar empresas. Tente novamente mais tarde.");
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, userCompanies.length, isLoading, getUserCompanies, forceGetUserCompanies]);
  
  // Listen for company-relation-changed events to refresh data
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        try {
          console.log('[useCompanies] Relação de empresas alterada, atualizando...');
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Erro ao atualizar empresas após alteração de relação:', error);
        }
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    // Add a new event listener for force-reload-companies
    const handleForceReload = async () => {
      if (user?.id) {
        try {
          console.log('[useCompanies] Forçando recarregamento de empresas');
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Erro ao forçar recarregamento de empresas:', error);
        }
      } else {
        try {
          console.log('[useCompanies] Forçando recarregamento de todas as empresas');
          await fetchCompanies();
        } catch (error) {
          console.error('[useCompanies] Erro ao forçar recarregamento de todas as empresas:', error);
        }
      }
    };
    
    window.addEventListener('force-reload-companies', handleForceReload);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceReload);
    };
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);
  
  // Try to restore previously selected company on hook initialization
  useEffect(() => {
    const restoreSelectedCompany = async () => {
      // Skip if we already have a selected company
      if (selectedCompany) return;
      
      // First try to get the full company object from local storage
      const cachedCompany = getStoredCompany();
      if (cachedCompany) {
        console.log('[useCompanies] Restaurando empresa selecionada do cache:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      }
      
      // If we have userCompanies but no selected company yet
      if (userCompanies.length > 0) {
        const storedCompanyId = getStoredCompanyId();
        
        if (storedCompanyId) {
          // Try to find in already loaded userCompanies
          const storedCompany = userCompanies.find(company => company.id === storedCompanyId);
          
          if (storedCompany) {
            setSelectedCompany(storedCompany);
            console.log('[useCompanies] Restaurando empresa selecionada do ID armazenado:', storedCompany.nome);
          } else {
            // If not found, try to fetch it
            try {
              const company = await getCompanyById(storedCompanyId);
              if (company) {
                setSelectedCompany(company);
                console.log('[useCompanies] Restaurando empresa selecionada do banco de dados:', company.nome);
              }
            } catch (error) {
              console.error('[useCompanies] Falha ao restaurar empresa do localStorage', error);
              localStorage.removeItem('selectedCompanyId');
              
              // If fetch failed but we have userCompanies, select the first one
              if (userCompanies.length > 0) {
                setSelectedCompany(userCompanies[0]);
                console.log('[useCompanies] Selecionada primeira empresa disponível após falha na busca:', userCompanies[0].nome);
              }
            }
          }
        } else if (userCompanies.length === 1) {
          // Automatically select the only company if there's just one
          setSelectedCompany(userCompanies[0]);
          console.log('[useCompanies] Auto-selecionada a única empresa disponível:', userCompanies[0].nome);
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId, getStoredCompany, setSelectedCompany]);
  
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
