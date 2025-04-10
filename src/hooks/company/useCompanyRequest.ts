
import { useRef } from "react";

// Minimum time between requests (in ms)
export const MIN_REQUEST_INTERVAL = 60000; // 60 segundos (aumentado para reduzir chamadas)

export const useCompanyRequest = () => {
  // Timestamp of the last request
  const lastFetchTimeRef = useRef<number>(0);
  // Flag to control ongoing requests
  const isFetchingRef = useRef<boolean>(false);
  // Request queue to manage concurrent requests
  const pendingRequestsRef = useRef<number>(0);
  
  /**
   * Checks if a new request should be made based on timing and current state
   */
  const shouldMakeRequest = (
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    // Se já estivermos buscando dados, não iniciar nova requisição
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Uma requisição já está em andamento. Ignorando nova requisição.');
      return false;
    }
    
    // Incrementar contador de requisições pendentes
    pendingRequestsRef.current += 1;
    
    // Limitar requisições pendentes a 2 no máximo
    if (pendingRequestsRef.current > 2 && !forceRefresh) {
      console.log(`Muitas requisições pendentes (${pendingRequestsRef.current}). Limitando.`);
      pendingRequestsRef.current -= 1;
      return false;
    }
    
    // Se for uma atualização forçada, sempre permitir
    if (forceRefresh) {
      console.log('Forçando atualização dos dados.');
      return true;
    }
    
    // Verificar se passou tempo suficiente desde a última requisição
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`Última requisição há ${Math.round(timeSinceLastFetch/1000)}s. Usando dados em cache (intervalo mín: ${interval/1000}s).`);
      pendingRequestsRef.current -= 1;
      return false;
    }
    
    return true;
  };
  
  /**
   * Marks the beginning of a request
   */
  const startRequest = (): void => {
    isFetchingRef.current = true;
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
