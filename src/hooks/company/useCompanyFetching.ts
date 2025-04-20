
import React, { useCallback, useRef, useMemo } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyRetry } from "./useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";

interface UseCompanyFetchingProps {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
}

export const useCompanyFetching = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchingProps) => {
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    pendingRequestsRef
  } = useCompanyRequest();
  
  const { executeWithRetry } = useCompanyRetry();
  const { 
    getCachedUserCompanies, 
    cacheUserCompanies, 
    clearCachedUserCompanies,
    removeCachedCompany,
    isCacheExpired 
  } = useCompanyCache();
  
  const companyFetchProps = {
    setIsLoading,
    setCompanies: setUserCompanies,
    setUserCompanies,
    setSelectedCompany,
    setError
  };
  
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch(companyFetchProps);
  
  // Estado para rastrear requisições e evitar duplicidades
  const fetchInProgressRef = useRef(false);
  // Controladores para abortar requisições ativas
  const abortControllerRef = useRef<AbortController | null>(null);
  // Timestamp da última requisição bem-sucedida
  const lastSuccessfulFetchRef = useRef<number>(0);
  // Flag para verificar se houve fetch nesta carga de página
  const didFetchOnPageLoadRef = useRef<boolean>(false);
  // ID único para este hook
  const hookInstanceIdRef = useRef<string>(`fetch-${Math.random().toString(36).substring(2, 9)}`);
  
  // Cache em memória para evitar requisições desnecessárias
  const memoryCache = useRef<{ 
    companies: Company[] | null, 
    timestamp: number 
  }>({ companies: null, timestamp: 0 });
  
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    // Se temos dados em cache e não estamos forçando atualização, use-os primeiro
    const cachedData = getCachedUserCompanies();
    if (cachedData && cachedData.length > 0 && !forceRefresh) {
      // Atualize o estado se os dados forem diferentes
      if (JSON.stringify(userCompanies) !== JSON.stringify(cachedData)) {
        setUserCompanies(cachedData);
      }
      
      // Se já temos dados em memória e já carregamos nesta sessão, retorne o cache
      if (memoryCache.current.companies && didFetchOnPageLoadRef.current && !forceRefresh) {
        console.log(`[${hookInstanceIdRef.current}] Usando cache em memória para evitar re-renderização.`);
        return cachedData;
      }
    }
    
    // Pular requisição se já tiver feito durante este carregamento de página
    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Já carregou empresas durante esta sessão. Usando dados em cache.`);
      return userCompanies;
    }
    
    // Throttling específico para este componente - mínimo 60 segundos entre requisições
    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const COMPONENT_SPECIFIC_THROTTLE = 60000; // 60 segundos
    
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < COMPONENT_SPECIFIC_THROTTLE && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Última requisição bem-sucedida foi há ${Math.round(timeSinceLastSuccess/1000)}s. Usando dados em cache.`);
      return userCompanies;
    }
    
    // Cancelar requisições existentes se forçando atualização
    if (forceRefresh && abortControllerRef.current) {
      console.log(`[${hookInstanceIdRef.current}] Cancelando requisição anterior devido à atualização forçada`);
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Se já houver uma requisição em andamento e não estamos forçando, retorne dados atuais
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log(`[${hookInstanceIdRef.current}] Uma operação de busca já está em andamento. Pulando requisição duplicada.`);
      return userCompanies;
    }
    
    // Verificar requisições pendentes
    console.log(`[${hookInstanceIdRef.current}] Requisições ativas: ${pendingRequestsRef.current}`);
    
    // Verificar se devemos fazer requisição
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    // Marcar início da requisição
    fetchInProgressRef.current = true;
    startRequest();
    setIsLoading(true);
    setError(null);
    incrementFetchCount();
    
    // Criar controlador para esta requisição
    abortControllerRef.current = new AbortController();
    
    try {
      // Usar dados em cache para atualização imediata da UI
      if (!forceRefresh) {
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          setUserCompanies(cachedData);
          console.log(`[${hookInstanceIdRef.current}] Usando dados em cache enquanto busca dados atualizados:`, cachedData.length, "empresas");
        }
      }
      
      // Realizar requisição para obter dados atualizados
      const result = await executeWithRetry(() => getCompanies(userId, abortControllerRef.current?.signal));
      
      // Marcar fim da requisição bem-sucedida
      completeRequest();
      
      // Registrar timestamp da requisição bem-sucedida
      lastSuccessfulFetchRef.current = Date.now();
      didFetchOnPageLoadRef.current = true;
      
      // Atualizar cache em memória
      memoryCache.current = { 
        companies: result, 
        timestamp: Date.now() 
      };
      
      // Armazenar empresas em cache quando buscadas com sucesso
      if (result && result.length > 0) {
        cacheUserCompanies(result);
        console.log(`[${hookInstanceIdRef.current}] Empresas buscadas e armazenadas com sucesso:`, result.length);
      }
      
      // Finalizar estado de carregamento
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      
      // Não mostrar erros para requisições abortadas
      if (error.name === 'AbortError') {
        console.log(`[${hookInstanceIdRef.current}] Requisição foi abortada`);
        setIsLoading(false);
        return userCompanies;
      }
      
      setError(error);
      console.error(`[${hookInstanceIdRef.current}] Erro ao buscar empresas:`, error);
      
      // Tentar usar cache como último recurso
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log(`[${hookInstanceIdRef.current}] Usando empresas em cache após falha`);
        setUserCompanies(cachedData);
        return cachedData;
      }
      
      return [];
    } finally {
      // Garantir que o estado seja resetado
      fetchInProgressRef.current = false;
      setIsLoading(false);
      resetRequestState();
      abortControllerRef.current = null;
    }
  }, [
    userCompanies,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    setError,
    incrementFetchCount,
    getCachedUserCompanies,
    executeWithRetry,
    getCompanies,
    setUserCompanies,
    pendingRequestsRef,
    cacheUserCompanies,
    setIsLoading
  ]);
  
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log(`[${hookInstanceIdRef.current}] Forçando busca de empresas do usuário e limpando cache primeiro`);
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    removeCachedCompany
  };
};
