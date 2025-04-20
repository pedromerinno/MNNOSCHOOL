
import React, { useCallback, useRef } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyRetry } from "./useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";
import { retryOperation } from "./utils/retryUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    clearCachedUserCompanies 
  } = useCompanyCache();
  
  const companyFetchProps = {
    setIsLoading,
    setCompanies: setUserCompanies,
    setUserCompanies,
    setSelectedCompany,
    setError,
    incrementFetchCount
  };
  
  const { getCompanyById } = useCompanyFetch(companyFetchProps);
  
  // Track fetch state to prevent duplicate calls
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulFetchRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTimestampRef = useRef<number>(0);
  
  // Função direta para buscar empresas do usuário usando RPC
  const fetchUserCompaniesDirectly = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    // Implement request throttling - at least 5 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimestampRef.current;
    const MIN_REQUEST_INTERVAL = 5000; // 5 seconds minimum between requests
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && lastRequestTimestampRef.current > 0) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Throttling request, waiting ${waitTime}ms before making another request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    console.log("Chamando RPC diretamente para buscar empresas do usuário:", userId);
    lastRequestTimestampRef.current = Date.now();
    
    const { data, error } = await supabase
      .rpc('get_user_companies', { user_id: userId });
      
    if (error) {
      console.error("Erro na chamada RPC:", error);
      consecutiveErrorsRef.current++;
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("RPC retornou dados inválidos:", data);
      return [];
    }
    
    console.log(`RPC retornou ${data.length} empresas:`, data);
    return data as Company[];
  };
  
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const THROTTLE = 30000; // 30 seconds - greatly increased cache time
    
    // Logs para diagnóstico
    console.log(`Iniciando getUserCompanies para usuário ${userId}, forceRefresh=${forceRefresh}`);
    console.log(`userCompanies.length=${userCompanies.length}`);
    
    // Use cached data if available and not forcing refresh with a longer throttle window
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < THROTTLE && userCompanies.length > 0) {
      console.log(`[useCompanyFetching] Last successful fetch was ${Math.round(timeSinceLastSuccess/1000)}s ago. Using cached data.`);
      return userCompanies;
    }
    
    if (forceRefresh && abortControllerRef.current) {
      console.log('Cancelling previous request due to forced refresh');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log('A fetch operation is already in progress. Skipping duplicate fetch.');
      return userCompanies;
    }
    
    console.log(`Active requests: ${pendingRequestsRef.current}`);
    
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    // Limpe qualquer timeout de retry anterior
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    fetchInProgressRef.current = true;
    startRequest();
    setIsLoading(true);
    setError(null);
    incrementFetchCount();
    
    abortControllerRef.current = new AbortController();
    
    try {
      // Usar dados em cache enquanto busca dados frescos
      if (!forceRefresh) {
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          setUserCompanies(cachedData);
          console.log("Using cached data while fetching fresh data:", cachedData.length, "companies");
          
          // Se existir apenas uma empresa, automaticamente seleciona-a
          if (cachedData.length === 1) {
            setSelectedCompany(cachedData[0]);
          }
        }
      }
      
      // Implement exponential backoff strategy with increased max retries and delay
      const initialRetryDelay = 2000 * (1 + (consecutiveErrorsRef.current * 0.5)); // Gradually increase initial delay
      const maxRetryDelay = 60000; // 60 seconds max delay - doubled
      const maxRetries = consecutiveErrorsRef.current > 3 ? 3 : 2; // Reduced max retries to avoid overwhelming
      
      // Chamar a função RPC diretamente com retries
      const result = await retryOperation(
        () => fetchUserCompaniesDirectly(userId, abortControllerRef.current?.signal),
        maxRetries,
        initialRetryDelay,
        maxRetryDelay
      );
      
      completeRequest();
      lastSuccessfulFetchRef.current = Date.now();
      consecutiveErrorsRef.current = 0; // Reseta contador de erros no sucesso
      
      if (result && result.length > 0) {
        cacheUserCompanies(result);
        setUserCompanies(result);
        console.log("Successfully fetched and cached", result.length, "companies");
        
        // Se apenas uma empresa, automaticamente seleciona
        if (result.length === 1) {
          setSelectedCompany(result[0]);
        }
      } else if (result.length === 0) {
        console.log("Usuário não tem empresas associadas");
        // Limpar seleção se não houver empresas
        setSelectedCompany(null);
      }
      
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setIsLoading(false);
        return userCompanies;
      }
      
      consecutiveErrorsRef.current += 1; // Rastreia erros consecutivos
      
      setError(error);
      console.error("Error fetching companies:", error);
      
      // Add user feedback about resource error
      if (error.message.includes('insufficient') || error.message.includes('resource')) {
        toast.error("Servidor sobrecarregado", {
          description: "Muitas solicitações simultâneas. Aguarde um momento e tente novamente."
        });
      } else {
        toast.error("Erro ao buscar empresas", {
          description: "Tentaremos novamente automaticamente"
        });
      }
      
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached companies after all retries failed");
        setUserCompanies(cachedData);
        
        // Agendar nova tentativa automaticamente com maior atraso proporcional ao número de falhas
        // Extended retry delay period significantly
        const retryDelay = 10000 + (Math.min(consecutiveErrorsRef.current, 5) * 5000);
        console.log(`Scheduling retry after ${retryDelay}ms due to ${consecutiveErrorsRef.current} consecutive errors`);
        
        retryTimeoutRef.current = setTimeout(() => {
          console.log("Tentando novamente após falha anterior...");
          getUserCompanies(userId, true);
        }, retryDelay);
        
        return cachedData;
      }
      
      return [];
    } finally {
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
    setUserCompanies,
    pendingRequestsRef,
    cacheUserCompanies,
    setIsLoading,
    setSelectedCompany
  ]);
  
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forcing user companies fetch and clearing cache first');
    clearCachedUserCompanies();
    // Reset error counter on manual refresh
    consecutiveErrorsRef.current = 0;
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  };
};
