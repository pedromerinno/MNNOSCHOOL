
import { useRef, useCallback } from "react";

// Optimized request interval to better balance performance and responsiveness
export const MIN_REQUEST_INTERVAL = 45000; // 45 seconds

export const useCompanyRequest = () => {
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const pendingRequestsRef = useRef<number>(0);
  const MAX_CONCURRENT_REQUESTS = 1;
  const timeoutRef = useRef<number | null>(null);
  const requestKeysRef = useRef<Record<string, number>>({});
  const errorCountRef = useRef<number>(0);
  const blockTimeRef = useRef<number>(0);
  const MAX_BLOCK_TIME = 300000;
  
  /**
   * Verifica tempo de bloqueio atual após erros
   */
  const checkErrorBlock = useCallback((): boolean => {
    if (blockTimeRef.current === 0) return false;
    
    const now = Date.now();
    const timeSinceLastBlock = now - lastFetchTimeRef.current;
    
    if (timeSinceLastBlock < blockTimeRef.current) {
      console.log(`[Company Request] Bloqueando requisição - em período de bloqueio por ${Math.round((blockTimeRef.current - timeSinceLastBlock)/1000)}s`);
      return true;
    }
    
    // Se passou o tempo de bloqueio, resetar
    if (timeSinceLastBlock > blockTimeRef.current) {
      blockTimeRef.current = 0;
      errorCountRef.current = 0;
    }
    
    return false;
  }, []);
  
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number,
    requestKey?: string
  ): boolean => {
    const now = Date.now();
    
    // Verificar bloqueio por erros
    if (!forceRefresh && checkErrorBlock()) {
      return false;
    }
    
    // Se houver um requestKey, verifica se já foi requisitado recentemente
    if (requestKey) {
      const lastKeyRequest = requestKeysRef.current[requestKey] || 0;
      const keyInterval = customInterval || MIN_REQUEST_INTERVAL;
      const timeSinceLastKeyRequest = now - lastKeyRequest;
      
      // Se já foi requisitado recentemente e não é forçado, bloqueia
      if (timeSinceLastKeyRequest < keyInterval && hasLocalData && !forceRefresh) {
        console.log(`[Company Request] Requisição "${requestKey}" bloqueada - última há ${Math.round(timeSinceLastKeyRequest/1000)}s (intervalo: ${keyInterval/1000}s)`);
        return false;
      }
    }
    
    // Se houver muitas requisições pendentes, bloqueia novas
    if (pendingRequestsRef.current >= MAX_CONCURRENT_REQUESTS) {
      console.log(`[Company Request] Bloqueando requisição - já existe ${pendingRequestsRef.current} requisição ativa`);
      return false;
    }
    
    // Se estiver já buscando, não permite nova requisição
    if (isFetchingRef.current && !forceRefresh) {
      console.log('[Company Request] Já existe uma requisição em andamento, bloqueando nova requisição');
      return false;
    }
    
    // Se forçar atualização, sempre permite (mas ainda respeita o limite de requisições concorrentes)
    if (forceRefresh) {
      console.log('[Company Request] Forçando atualização, permitindo requisição');
      return true;
    }
    
    // Verificar intervalo mínimo entre requisições
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`[Company Request] Intervalo entre requisições muito pequeno (${Math.round(timeSinceLastFetch/1000)}s), bloqueando`);
      return false;
    }
    
    return true;
  }, [checkErrorBlock]);
  
  /**
   * Utiliza debounce para evitar múltiplas chamadas em curto período
   */
  const debouncedRequest = useCallback((callback: () => void, delay: number = 300) => {
    if (typeof timeoutRef.current === 'number') {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      callback();
      timeoutRef.current = null;
    }, delay);
  }, []);
  
  const startRequest = useCallback((requestKey?: string) => {
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    lastFetchTimeRef.current = Date.now();
    
    if (requestKey) {
      requestKeysRef.current[requestKey] = Date.now();
    }
    
    console.log(`[Company Request] Iniciando requisição. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  const completeRequest = useCallback((isError: boolean = false) => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
    isFetchingRef.current = false;
    
    console.log(`[Company Request] Requisição concluída. Total pendente: ${pendingRequestsRef.current}`);
    
    if (isError) {
      errorCountRef.current += 1;
      
      // Implementa backoff exponencial para erros consecutivos
      if (errorCountRef.current > 1) {
        // Começa com 10 segundos e dobra a cada erro, até MAX_BLOCK_TIME
        blockTimeRef.current = Math.min(
          MAX_BLOCK_TIME, 
          10000 * Math.pow(2, errorCountRef.current - 1)
        );
        
        console.log(`[Company Request] Erro consecutivo #${errorCountRef.current}. Bloqueando por ${blockTimeRef.current/1000}s`);
      }
    } else {
      // Reset do contador de erros ao ter sucesso
      errorCountRef.current = 0;
      blockTimeRef.current = 0;
    }
  }, []);
  
  const resetRequestState = useCallback(() => {
    isFetchingRef.current = false;
    console.log(`[Company Request] Estado de requisição resetado. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  return {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    debouncedRequest,
    pendingRequestsRef
  };
};
