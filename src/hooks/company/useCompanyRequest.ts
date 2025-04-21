
import { useRef } from "react";

// Reducing the cache interval to 60 seconds to ensure more frequent updates
export const MIN_REQUEST_INTERVAL = 60000; // 1 minute

export const useCompanyRequest = () => {
  // Timestamp da última requisição
  const lastFetchTimeRef = useRef<number>(0);
  // Flag para controlar requisições em andamento
  const isFetchingRef = useRef<boolean>(false);
  // Fila de requisições para gerenciar requisições concorrentes
  const pendingRequestsRef = useRef<number>(0);
  // Número máximo de requisições concorrentes para prevenir esgotamento de recursos
  const MAX_CONCURRENT_REQUESTS = 2; // Increased to allow more concurrent requests
  
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
  };
  
  /**
   * Marca o início de uma requisição
   */
  const startRequest = (): void => {
    // Se já estiver buscando, não inicia nova requisição
    if (isFetchingRef.current) {
      console.log('[Company Request] Já existe uma requisição em andamento, ignorando');
      return;
    }
    
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    console.log(`[Company Request] Iniciando requisição. Total pendente: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Atualiza o timestamp da última requisição bem-sucedida
   */
  const completeRequest = (): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    // Decrementa o contador de requisições pendentes
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Requisição completada. Total pendente: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Marca requisição como finalizada mas sem atualizar o timestamp
   * (usado para requisições falhas)
   */
  const resetRequestState = (): void => {
    isFetchingRef.current = false;
    // Decrementa o contador de requisições pendentes
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Estado de requisição resetado. Total pendente: ${pendingRequestsRef.current}`);
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
