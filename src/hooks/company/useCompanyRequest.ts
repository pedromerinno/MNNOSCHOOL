
import { useRef } from "react";

// Minimum time between requests (in ms) - increased to reduce API calls
export const MIN_REQUEST_INTERVAL = 120000; // 2 minutes

export const useCompanyRequest = () => {
  // Timestamp of the last request
  const lastFetchTimeRef = useRef<number>(0);
  // Flag to control ongoing requests
  const isFetchingRef = useRef<boolean>(false);
  // Request queue to manage concurrent requests
  const pendingRequestsRef = useRef<number>(0);
  
  /**
   * Checks if a new request should be made based on timing and current state
   */
  const shouldMakeRequest = (
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    // If already fetching, don't start new request
    if (isFetchingRef.current && !forceRefresh) {
      console.log('A request is already in progress. Ignoring new request.');
      return false;
    }
    
    // Increment pending requests counter
    pendingRequestsRef.current += 1;
    
    // Limit pending requests to 2 maximum
    if (pendingRequestsRef.current > 2 && !forceRefresh) {
      console.log(`Too many pending requests (${pendingRequestsRef.current}). Limiting.`);
      pendingRequestsRef.current -= 1;
      return false;
    }
    
    // If forced update, always allow
    if (forceRefresh) {
      console.log('Forcing data refresh.');
      return true;
    }
    
    // Check if enough time has passed since last request
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`Last request ${Math.round(timeSinceLastFetch/1000)}s ago. Using cached data (min interval: ${interval/1000}s).`);
      pendingRequestsRef.current -= 1;
      return false;
    }
    
    return true;
  };
  
  /**
   * Marks the beginning of a request
   */
  const startRequest = (): void => {
    isFetchingRef.current = true;
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
