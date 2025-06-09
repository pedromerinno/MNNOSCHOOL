
import { useRef, useCallback, useEffect } from 'react';

export const useCompanyRequest = () => {
  const pendingRequestsRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const throttleTimestampsRef = useRef<Record<string, number>>({});
  
  const shouldMakeRequest = useCallback((forceRefresh: boolean, hasCachedData: boolean, requestingComponent?: string, cacheKey?: string): boolean => {
    if (forceRefresh) return true;
    
    if (pendingRequestsRef.current > 0) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request already in progress, skipping`);
      return false;
    }
    
    const now = Date.now();
    const THROTTLE_MS = 3000; // Aumentado para 3 segundos
    
    // If we have a cache key, use more specific throttling
    if (cacheKey && throttleTimestampsRef.current[cacheKey]) {
      const timeSinceLastRequest = now - throttleTimestampsRef.current[cacheKey];
      if (hasCachedData && timeSinceLastRequest < THROTTLE_MS) {
        console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request throttled for key ${cacheKey}, using cached data`);
        return false;
      }
    } else if (hasCachedData && lastRequestTimeRef.current > 0 && now - lastRequestTimeRef.current < THROTTLE_MS) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request throttled, using cached data`);
      return false;
    }
    
    return true;
  }, []);
  
  const startRequest = useCallback((cacheKey?: string) => {
    pendingRequestsRef.current += 1;
    lastRequestTimeRef.current = Date.now();
    
    if (cacheKey) {
      throttleTimestampsRef.current[cacheKey] = Date.now();
    }
  }, []);
  
  const completeRequest = useCallback((wasSuccessful: boolean = true) => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
  }, []);
  
  const resetRequestState = useCallback(() => {
    pendingRequestsRef.current = 0;
  }, []);
  
  // Add a debounced request function that properly types the arguments
  const debouncedRequest = useCallback(<T extends any[]>(callback: (...args: T) => Promise<any> | void, delay: number = 500, key?: string) => {
    const timerKey = key || 'default';
    
    return (...args: T) => {
      // Clear any existing timers for this key
      if (debounceTimersRef.current[timerKey]) {
        clearTimeout(debounceTimersRef.current[timerKey]);
      }
      
      debounceTimersRef.current[timerKey] = setTimeout(() => {
        delete debounceTimersRef.current[timerKey];
        callback(...args);
      }, delay);
    };
  }, []);
  
  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending debounce timers
      Object.values(debounceTimersRef.current).forEach(timer => {
        clearTimeout(timer);
      });
      debounceTimersRef.current = {};
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
