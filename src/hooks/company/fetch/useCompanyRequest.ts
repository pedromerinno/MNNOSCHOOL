
import { useRef, useCallback } from "react";

// Optimized request interval to better balance performance and responsiveness
export const MIN_REQUEST_INTERVAL = 60000; // 60 seconds

export const useCompanyRequest = () => {
  // Reference for tracking the timestamp of the last fetch
  const lastFetchTimeRef = useRef<number>(0);
  // Flag to track if a fetch operation is in progress
  const isFetchingRef = useRef<boolean>(false);
  // Counter for tracking pending requests
  const pendingRequestsRef = useRef<number>(0);
  // Maximum number of concurrent requests to prevent overloading
  const MAX_CONCURRENT_REQUESTS = 1;
  // Cache for request keys to prevent duplicates
  const requestKeysRef = useRef<Record<string, number>>({});
  // Error tracking for implementing backoff
  const errorCountRef = useRef<number>(0);
  // Backoff time tracking
  const backoffTimeRef = useRef<number>(0);
  
  /**
   * Determines if a new request should be made based on timing and state
   */
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number,
    requestKey?: string
  ): boolean => {
    const now = Date.now();
    
    // If there's an active backoff period due to errors
    if (backoffTimeRef.current > 0 && !forceRefresh) {
      if (now - lastFetchTimeRef.current < backoffTimeRef.current) {
        console.log(`[Company Request] In backoff period (${Math.round((backoffTimeRef.current - (now - lastFetchTimeRef.current))/1000)}s remaining)`);
        return false;
      } else {
        // Reset backoff after period has passed
        backoffTimeRef.current = 0;
        errorCountRef.current = 0;
      }
    }
    
    // Check request key cache
    if (requestKey && !forceRefresh) {
      const lastKeyRequest = requestKeysRef.current[requestKey] || 0;
      const keyInterval = customInterval || MIN_REQUEST_INTERVAL;
      
      if (now - lastKeyRequest < keyInterval && hasLocalData) {
        console.log(`[Company Request] Request "${requestKey}" throttled - last request was ${Math.round((now - lastKeyRequest)/1000)}s ago`);
        return false;
      }
    }
    
    // Check for concurrent request limit
    if (pendingRequestsRef.current >= MAX_CONCURRENT_REQUESTS && !forceRefresh) {
      console.log(`[Company Request] Max concurrent requests (${MAX_CONCURRENT_REQUESTS}) reached, request queued`);
      return false;
    }
    
    // Check if a fetch is already in progress
    if (isFetchingRef.current && !forceRefresh) {
      console.log('[Company Request] Request in progress, new request blocked');
      return false;
    }
    
    // Force refresh always bypasses time-based checks
    if (forceRefresh) {
      console.log('[Company Request] Force refresh requested, proceeding');
      return true;
    }
    
    // Standard interval-based throttling
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`[Company Request] Request too soon (${Math.round(timeSinceLastFetch/1000)}s < ${interval/1000}s), using cached data`);
      return false;
    }
    
    return true;
  }, []);
  
  /**
   * Marks the start of a request
   */
  const startRequest = useCallback((requestKey?: string): void => {
    const now = Date.now();
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    lastFetchTimeRef.current = now;
    
    if (requestKey) {
      requestKeysRef.current[requestKey] = now;
    }
    
    console.log(`[Company Request] Request started. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Marks the completion of a request
   */
  const completeRequest = useCallback((isError: boolean = false): void => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
    isFetchingRef.current = false;
    
    if (isError) {
      errorCountRef.current += 1;
      
      // Implement exponential backoff for consecutive errors
      if (errorCountRef.current > 1) {
        // Start with 5 seconds and double with each error, capped at 5 minutes
        backoffTimeRef.current = Math.min(300000, 5000 * Math.pow(2, errorCountRef.current - 1));
        console.log(`[Company Request] Error #${errorCountRef.current}, implementing ${backoffTimeRef.current/1000}s backoff`);
      }
    } else {
      // Reset error count on success
      errorCountRef.current = 0;
    }
    
    console.log(`[Company Request] Request completed. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Resets the request state (used for cleanup)
   */
  const resetRequestState = useCallback((): void => {
    isFetchingRef.current = false;
    console.log(`[Company Request] Request state reset. Total pending: ${pendingRequestsRef.current}`);
  }, []);
  
  /**
   * Clears all request keys (used when forcing a full refresh)
   */
  const clearRequestKeys = useCallback((): void => {
    requestKeysRef.current = {};
    console.log('[Company Request] Request key cache cleared');
  }, []);
  
  return {
    pendingRequestsRef,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    clearRequestKeys
  };
};
