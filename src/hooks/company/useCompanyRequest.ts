
import { useRef, useCallback } from 'react';

export const useCompanyRequest = () => {
  const pendingRequestsRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);
  
  const shouldMakeRequest = useCallback((forceRefresh: boolean, hasCachedData: boolean): boolean => {
    if (forceRefresh) return true;
    
    if (pendingRequestsRef.current > 0) {
      console.log('[useCompanyRequest] Request already in progress, skipping');
      return false;
    }
    
    const now = Date.now();
    const THROTTLE_MS = 5000; // 5 seconds
    
    if (hasCachedData && lastRequestTimeRef.current > 0 && now - lastRequestTimeRef.current < THROTTLE_MS) {
      console.log('[useCompanyRequest] Request throttled, using cached data');
      return false;
    }
    
    return true;
  }, []);
  
  const startRequest = useCallback(() => {
    pendingRequestsRef.current += 1;
    lastRequestTimeRef.current = Date.now();
  }, []);
  
  const completeRequest = useCallback(() => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
  }, []);
  
  const resetRequestState = useCallback(() => {
    pendingRequestsRef.current = 0;
  }, []);
  
  return {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    pendingRequestsRef
  };
};
