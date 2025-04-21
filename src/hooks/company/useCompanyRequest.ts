
import { useRef, useCallback } from "react";

// Reduzindo o intervalo mínimo de requisição para 30 segundos para mais frequência de atualizações
export const MIN_REQUEST_INTERVAL = 30000; // 30 segundos

export const useCompanyRequest = () => {
  // Timestamp da última requisição
  const lastFetchTimeRef = useRef<number>(0);
  // Flag para controlar requisições em andamento
  const isFetchingRef = useRef<boolean>(false);
  // Fila de requisições para gerenciar requisições concorrentes
  const pendingRequestsRef = useRef<number>(0);
  // Limite de requisições concorrentes para evitar sobrecarga
  const MAX_CONCURRENT_REQUESTS = 1; // Limitando a uma requisição por vez
  // Controlador para debouncing de requisições
  const timeoutRef = useRef<number | null>(null);
  
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
  
  /**
   * Verifica se uma nova requisição deve ser feita com base no tempo e estado atual
   */
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
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
      console.log('[Company Request] Forçando atualização de dados conforme solicitado');
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
  }, []);
  
  /**
   * Marca o início de uma requisição
   */
  const startRequest = useCallback((): void => {
    // Se já estiver buscando, não inicia nova requisição
    if (isFetchingRef.current) {
      console.log('[Company Request] Já existe uma requisição em andamento, ignorando');
      return;
    }
    
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    console.log(`[Company Request] Iniciando requisição. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Atualiza o timestamp da última requisição bem-sucedida
   */
  const completeRequest = useCallback((): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    // Decrementa o contador de requisições pendentes
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Requisição completada. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Marca requisição como finalizada mas sem atualizar o timestamp
   * (usado para requisições falhas)
   */
  const resetRequestState = useCallback((): void => {
    isFetchingRef.current = false;
    // Decrementa o contador de requisições pendentes
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Estado de requisição resetado. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  return {
    lastFetchTimeRef,
    isFetchingRef,
    pendingRequestsRef,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    debouncedRequest
  };
};
