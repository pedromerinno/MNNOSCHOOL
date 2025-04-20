
import { useRef, useCallback } from "react";

const MIN_REQUEST_INTERVAL = 120000; // 2 minutes

export const useCompanyRequest = () => {
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const pendingRequestsRef = useRef<number>(0);
  const MAX_CONCURRENT_REQUESTS = 1;
  
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    if (pendingRequestsRef.current >= MAX_CONCURRENT_REQUESTS) {
      console.log(`[Company Request] Blocking request - already have ${pendingRequestsRef.current} active request`);
      return false;
    }
    
    if (isFetchingRef.current && !forceRefresh) {
      console.log('[Company Request] Request in progress, blocking new request');
      return false;
    }
    
    if (forceRefresh) {
      console.log('[Company Request] Forcing data refresh as requested');
      return true;
    }
    
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`[Company Request] Last request was ${Math.round(timeSinceLastFetch/1000)}s ago. Using cached data (min interval: ${interval/1000}s).`);
      return false;
    }
    
    return true;
  }, []);
  
  const startRequest = useCallback((): void => {
    if (isFetchingRef.current) {
      console.log('[Company Request] Request already in progress, ignoring');
      return;
    }
    
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    console.log(`[Company Request] Starting request. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
  const completeRequest = useCallback((): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request completed. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
  const resetRequestState = useCallback((): void => {
    isFetchingRef.current = false;
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request state reset. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
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
