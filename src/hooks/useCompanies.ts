
import { useState, useEffect, useCallback, useRef } from "react";
import { Company } from "@/types/company";
import { useCompanyFetch } from "./company/useCompanyFetch";
import { useCompanySelection } from "./company/useCompanySelection";
import { useCompanyCreate } from "./company/useCompanyCreate";
import { useCompanyUpdate } from "./company/useCompanyUpdate";
import { useCompanyDelete } from "./company/useCompanyDelete";
import { useCompanyUserManagement } from "./company/useCompanyUserManagement";
import { useCompanyCache } from "./company/useCompanyCache";
import { useCompanyRetry } from "./company/useCompanyRetry";
import { useCompanyEvents } from "./company/useCompanyEvents";

// Tempo mínimo entre requisições (em ms)
const MIN_REQUEST_INTERVAL = 10000; // 10 segundos

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  
  // Timestamp da última requisição
  const lastFetchTimeRef = useRef<number>(0);
  // Flag para controle de requisição em andamento
  const isFetchingRef = useRef<boolean>(false);
  
  // Import functionality from individual hooks
  const { 
    fetchCompanies, 
    getUserCompanies: getCompanies, 
    getCompanyById 
  } = useCompanyFetch({ 
    setIsLoading, 
    setCompanies, 
    setUserCompanies, 
    setSelectedCompany 
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

  const { executeWithRetry } = useCompanyRetry();
  const { cacheUserCompanies, getCachedUserCompanies } = useCompanyCache();
  const { dispatchCompanySelected } = useCompanyEvents(setSelectedCompany);

  // Listen for company selection events
  useCompanyEvents(setSelectedCompany);

  // Try to restore previously selected company on hook initialization
  useEffect(() => {
    const restoreSelectedCompany = async () => {
      // Skip if we already have a selected company
      if (selectedCompany) return;
      
      // First try to get the full company object from local storage
      const cachedCompany = getStoredCompany();
      if (cachedCompany) {
        console.log('Restored selected company from cache:', cachedCompany.nome);
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
            console.log('Restored selected company from localStorage ID:', storedCompany.nome);
          } else {
            // If not found, try to fetch it
            try {
              const company = await getCompanyById(storedCompanyId);
              if (company) {
                setSelectedCompany(company);
                console.log('Restored selected company from database:', company.nome);
              }
            } catch (error) {
              console.error('Failed to restore company from localStorage', error);
              localStorage.removeItem('selectedCompanyId');
              
              // If fetch failed but we have userCompanies, select the first one
              if (userCompanies.length > 0) {
                setSelectedCompany(userCompanies[0]);
                console.log('Selected first available company after fetch failure:', userCompanies[0].nome);
              }
            }
          }
        } else if (userCompanies.length === 1) {
          // Automatically select the only company if there's just one
          setSelectedCompany(userCompanies[0]);
          console.log('Auto-selected the only available company:', userCompanies[0].nome);
        }
      }
    };

    restoreSelectedCompany();
  }, [userCompanies, selectedCompany, getCompanyById, getStoredCompanyId, getStoredCompany]);

  // Versão com controle de tempo entre requisições
  const getUserCompanies = useCallback(async (userId: string, forceRefresh: boolean = false): Promise<Company[]> => {
    const now = Date.now();
    
    // Verifica se já há uma requisição em andamento
    if (isFetchingRef.current) {
      console.log('Uma requisição já está em andamento. Ignorando nova solicitação.');
      return userCompanies;
    }
    
    // Verifica se passou tempo suficiente desde a última requisição
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < MIN_REQUEST_INTERVAL && userCompanies.length > 0 && !forceRefresh) {
      console.log(`Última requisição foi há ${Math.round(timeSinceLastFetch/1000)}s. Usando dados em cache.`);
      return userCompanies;
    }
    
    // Marca início da requisição
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setError(null);
    setFetchCount(prev => prev + 1);
    
    try {
      // Usar dados em cache para atualização imediata da UI
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        setUserCompanies(cachedData);
      }
      
      // Realizar requisição para obter dados atualizados
      const result = await executeWithRetry(() => getCompanies(userId));
      
      // Atualiza o timestamp da última requisição bem-sucedida
      lastFetchTimeRef.current = Date.now();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Try to load from cache as last resort
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached companies after all retries failed");
        setUserCompanies(cachedData);
        return cachedData;
      }
      
      return [];
    } finally {
      // Marca fim da requisição
      isFetchingRef.current = false;
    }
  }, [userCompanies, executeWithRetry, getCompanies, getCachedUserCompanies]);

  // Versão forçada que ignora verificações de tempo
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forçando busca de empresas do usuário');
    
    // Mesmo que esteja em andamento, vamos marcar para uma nova requisição
    isFetchingRef.current = false;
    return getUserCompanies(userId, true);
  }, [getUserCompanies]);

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
    removeUserFromCompany
  };
};
