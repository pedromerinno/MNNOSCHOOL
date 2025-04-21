
import { useRef, useCallback } from "react";

// Reduzindo o intervalo mínimo de requisição para 45 segundos para balancear frequência e performance
export const MIN_REQUEST_INTERVAL = 45000; // 45 segundos

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
  // Rastreamento de requisições por chave para evitar duplicação
  const requestKeysRef = useRef<Record<string, number>>({});
  
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
    customInterval?: number,
    requestKey?: string
  ): boolean => {
    const now = Date.now();
    
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
  const startRequest = useCallback((requestKey?: string): void => {
    // Se já estiver buscando, não inicia nova requisição
    if (isFetchingRef.current) {
      console.log('[Company Request] Já existe uma requisição em andamento, ignorando');
      return;
    }
    
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    
    // Se tiver uma chave, registra o timestamp dessa requisição específica
    if (requestKey) {
      requestKeysRef.current[requestKey] = Date.now();
    }
    
    console.log(`[Company Request] Iniciando requisição${requestKey ? ` (${requestKey})` : ''}. Total pendente: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Atualiza o timestamp da última requisição bem-sucedida
   */
  const completeRequest = useCallback((requestKey?: string): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    
    // Decrementa o contador de requisições pendentes
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    
    // Se tiver uma chave, atualiza o timestamp dessa requisição específica
    if (requestKey) {
      requestKeysRef.current[requestKey] = Date.now();
    }
    
    console.log(`[Company Request] Requisição${requestKey ? ` (${requestKey})` : ''} completada. Total pendente: ${pendingRequestsRef.current}`);
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
  
  /**
   * Limpa todas as chaves de requisição armazenadas
   */
  const clearRequestKeys = useCallback((): void => {
    requestKeysRef.current = {};
    console.log('[Company Request] Chaves de requisição limpas');
  }, []);
  
  return {
    lastFetchTimeRef,
    isFetchingRef,
    pendingRequestsRef,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    debouncedRequest,
    clearRequestKeys
  };
};
