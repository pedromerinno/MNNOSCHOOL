
import { useCallback, useEffect } from 'react';
import { requestService } from '@/services/RequestService';

export const useCompanyRequest = () => {
  /**
   * Verifica se uma requisição deve ser executada
   */
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean,
    hasCachedData: boolean,
    requestingComponent?: string,
    cacheKey?: string
  ): boolean => {
    return requestService.shouldMakeRequest({
      requestId: cacheKey || `company-request-${requestingComponent || 'default'}`,
      force: forceRefresh,
      throttleMs: 5000 // 5 segundos
    });
  }, []);
  
  /**
   * Marca o início de uma requisição
   */
  const startRequest = useCallback((cacheKey?: string) => {
    const requestId = cacheKey || 'company-request-default';
    requestService.startRequest(requestId);
  }, []);
  
  /**
   * Marca o fim de uma requisição
   */
  const completeRequest = useCallback((_wasSuccessful: boolean = true) => {
    // Parâmetro _wasSuccessful mantido para compatibilidade, mas não é utilizado
    // A marcação é feita por ID, não por status
  }, []);
  
  /**
   * Reseta o estado de todas as requisições
   */
  const resetRequestState = useCallback(() => {
    requestService.resetAllRequests();
  }, []);
  
  /**
   * Cria uma função com debounce
   */
  const debouncedRequest = useCallback(<T extends any[]>(
    callback: (...args: T) => Promise<any> | void,
    delay: number = 300,
    key?: string
  ) => {
    return requestService.debounce(callback, delay, key);
  }, []);
  
  // Limpa recursos ao desmontar o componente
  useEffect(() => {
    return () => {
      requestService.clearAllDebouncers();
    };
  }, []);
  
  return {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    pendingRequestsRef: { current: 0 }, // Mantido para compatibilidade
    debouncedRequest
  };
};
