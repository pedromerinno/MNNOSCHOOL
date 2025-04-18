
import { useRef } from "react";

// Increasing to 10 seconds to reduce frequency of API calls during errors
export const MIN_REQUEST_INTERVAL = 10000; // 10 seconds 

export const useCompanyRequest = () => {
  // Timestamp of the last request
  const lastFetchTimeRef = useRef<number>(0);
  // Flag to control ongoing requests
  const isFetchingRef = useRef<boolean>(false);
  // Request queue to manage concurrent requests
  const pendingRequestsRef = useRef<number>(0);
  // Maximum number of concurrent requests to prevent resource exhaustion
  const MAX_CONCURRENT_REQUESTS = 2;
  
  /**
   * Checks if a new request should be made based on timing and current state
   */
  const shouldMakeRequest = (
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    // If there are too many pending requests, block new ones
    if (pendingRequestsRef.current >= MAX_CONCURRENT_REQUESTS) {
      console.log(`[Company Request] Too many concurrent requests (${pendingRequestsRef.current}). Throttling.`);
      return false;
    }
    
    // If forced update, always allow (but still respect concurrent request limit)
    if (forceRefresh) {
      console.log('[Company Request] Forcing data refresh as requested.');
      return true;
    }
    
    // Check if enough time has passed since last request
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`[Company Request] Last request ${Math.round(timeSinceLastFetch/1000)}s ago. Using cached data (min interval: ${interval/1000}s).`);
      return false;
    }
    
    return true;
  };
  
  /**
   * Marks the beginning of a request
   */
  const startRequest = (): void => {
    isFetchingRef.current = true;
    pendingRequestsRef.current += 1;
    console.log(`[Company Request] Starting request. Total pending: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Updates the timestamp of the last successful request
   */
  const completeRequest = (): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
    // Decrement pending requests counter
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request completed. Total pending: ${pendingRequestsRef.current}`);
  };
  
  /**
   * Marks request as finished but without updating the timestamp
   * (used for failed requests)
   */
  const resetRequestState = (): void => {
    isFetchingRef.current = false;
    // Decrement pending requests counter
    if (pendingRequestsRef.current > 0) {
      pendingRequestsRef.current -= 1;
    }
    console.log(`[Company Request] Request reset. Total pending: ${pendingRequestsRef.current}`);
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
