
import { useRef, useCallback, useEffect } from 'react';

export const useCompanyRequest = () => {
  const pendingRequestsRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const throttleTimestampsRef = useRef<Record<string, number>>({});
  const skipNextRequestRef = useRef<boolean>(false);
  
  const shouldMakeRequest = useCallback((forceRefresh: boolean, hasCachedData: boolean, requestingComponent?: string, cacheKey?: string): boolean => {
    // Skip if explicitly marked for skipping (used for back-to-back events)
    if (skipNextRequestRef.current && !forceRefresh) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request skipped by controller flag`);
      skipNextRequestRef.current = false;
      return false;
    }
    
    if (forceRefresh) return true;
    
    // Skip if requests are already in progress
    if (pendingRequestsRef.current > 0) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request already in progress (${pendingRequestsRef.current}), skipping`);
      return false;
    }
    
    const now = Date.now();
    const THROTTLE_MS = 10000; // 10 seconds - more aggressive throttling
    
    // If we have a cache key, use more specific throttling
    if (cacheKey && throttleTimestampsRef.current[cacheKey]) {
      const timeSinceLastRequest = now - throttleTimestampsRef.current[cacheKey];
      if (hasCachedData && timeSinceLastRequest < THROTTLE_MS) {
        console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request throttled for key ${cacheKey}, using cached data (${Math.round(timeSinceLastRequest/1000)}s ago)`);
        return false;
      }
    } else if (hasCachedData && lastRequestTimeRef.current > 0 && now - lastRequestTimeRef.current < THROTTLE_MS) {
      console.log(`[useCompanyRequest${requestingComponent ? '-' + requestingComponent : ''}] Request throttled, using cached data (${Math.round((now - lastRequestTimeRef.current)/1000)}s ago)`);
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
  
  // Enhanced debounce with better request handling
  const debouncedRequest = useCallback(<T extends any[]>(callback: (...args: T) => Promise<any> | void, delay: number = 300, key?: string) => {
    const timerKey = key || 'default';
    
    return (...args: T) => {
      // Clear any existing timers for this key
      if (debounceTimersRef.current[timerKey]) {
        clearTimeout(debounceTimersRef.current[timerKey]);
      }
      
      // Set flag to skip next automated request as we're handling it here
      skipNextRequestRef.current = true;
      
      debounceTimersRef.current[timerKey] = setTimeout(() => {
        delete debounceTimersRef.current[timerKey];
        callback(...args);
        
        // Reset skip flag if it wasn't reset already
        setTimeout(() => {
          skipNextRequestRef.current = false;
        }, 200);
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
    debouncedRequest,
    skipNextRequest: () => { skipNextRequestRef.current = true; }
  };
};
