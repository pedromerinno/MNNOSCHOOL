
import { useRef } from "react";

// Aumentando para 30 segundos para reduzir drasticamente a frequência de chamadas API
export const MIN_REQUEST_INTERVAL = 30000; // 30 segundos 

export const useCompanyRequest = () => {
  // Timestamp da última requisição
  const lastFetchTimeRef = useRef<number>(0);
  // Flag para controlar requisições em andamento
  const isFetchingRef = useRef<boolean>(false);
  // Fila de requisições para gerenciar requisições concorrentes
  const pendingRequestsRef = useRef<number>(0);
  // Número máximo de requisições concorrentes para prevenir esgotamento de recursos
  const MAX_CONCURRENT_REQUESTS = 1;
  
  /**
   * Verifica se uma nova requisição deve ser feita com base no tempo e estado atual
   */
  const shouldMakeRequest = (
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    // Se houver muitas requisições pendentes, bloqueia novas
    if (pendingRequestsRef.current >= MAX_CONCURRENT_REQUESTS) {
      console.log(`[Company Request] Muitas requisições concorrentes (${pendingRequestsRef.current}). Limitando.`);
      return false;
    }
    
    // Se forçar atualização, sempre permite (mas ainda respeita o limite de requisições concorrentes)
    if (forceRefresh) {
      console.log('[Company Request] Forçando atualização de dados conforme solicitado.');
      return true;
    }
    
    // Verifica se passou tempo suficiente desde a última requisição
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`[Company Request] Última requisição há ${Math.round(timeSinceLastFetch/1000)}s. Usando dados em cache (intervalo mín: ${interval/1000}s).`);
      return false;
    }
    
    return true;
  };
  
  /**
   * Marks the beginning of a request
   */
  const startRequest = (): void => {
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    console.log(`[Company Request] Starting request. Total pending: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Updates the timestamp of the last successful request
   */
  const completeRequest = (): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    // Decrement pending requests counter
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request completed. Total pending: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Marks request as finished but without updating the timestamp
   * (used for failed requests)
   */
  const resetRequestState = (): void => {
    isFetchingRef.current = false;
    // Decrement pending requests counter
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request reset. Total pending: ${pendingRequestsRef.current}`);
  };
  
  return {
    lastFetchTimeRef,
    isFetchingRef,
    pendingRequestsRef,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState
  };
};
