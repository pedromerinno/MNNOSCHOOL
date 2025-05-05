
import { useRef, useCallback, useEffect } from 'react';

export const useCompanyRequest = () => {
  const pendingRequestsRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);
  
  const shouldMakeRequest = useCallback((forceRefresh: boolean, hasCachedData: boolean, requestingComponent?: string, cacheKey?: string): boolean => {
    if (forceRefresh) return true;
    
    if (pendingRequestsRef.current > 0) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request already in progress, skipping`);
      return false;
    }
    
    const now = Date.now();
    const THROTTLE_MS = 5000; // 5 seconds
    
    if (hasCachedData && lastRequestTimeRef.current > 0 && now - lastRequestTimeRef.current < THROTTLE_MS) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request throttled, using cached data`);
      return false;
    }
    
    return true;
  }, []);
  
  const startRequest = useCallback((cacheKey?: string) => {
    pendingRequestsRef.current += 1;
    lastRequestTimeRef.current = Date.now();
  }, []);
  
  const completeRequest = useCallback((wasSuccessful: boolean = true) => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
  }, []);
  
  const resetRequestState = useCallback(() => {
    pendingRequestsRef.current = 0;
  }, []);
  
  // Add a debounced request function
  const debouncedRequest = useCallback((callback: () => Promise<any> | void, delay: number = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }, []);
  
  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      // Nothing to clean up here, but the hook is ready for future expansion
    };
  }, []);
  
  return {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    pendingRequestsRef,
    debouncedRequest
  };
};
