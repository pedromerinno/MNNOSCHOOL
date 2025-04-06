
import { useRef } from "react";

// Minimum time between requests (in ms)
export const MIN_REQUEST_INTERVAL = 10000; // 10 seconds

export const useCompanyRequest = () => {
  // Timestamp of the last request
  const lastFetchTimeRef = useRef<number>(0);
  // Flag to control ongoing requests
  const isFetchingRef = useRef<boolean>(false);
  
  /**
   * Checks if a new request should be made based on timing and current state
   */
  const shouldMakeRequest = (
    forceRefresh: boolean, 
    hasLocalData: boolean, 
    customInterval?: number
  ): boolean => {
    const now = Date.now();
    
    // If there's already an ongoing request
    if (isFetchingRef.current) {
      console.log('A request is already in progress. Ignoring new request.');
      return false;
    }
    
    // If forced refresh, always make request
    if (forceRefresh) {
      return true;
    }
    
    // Check if enough time has passed since the last request
    const interval = customInterval || MIN_REQUEST_INTERVAL;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < interval && hasLocalData) {
      console.log(`Last request was ${Math.round(timeSinceLastFetch/1000)}s ago. Using cached data.`);
      return false;
    }
    
    return true;
  };
  
  /**
   * Marks the beginning of a request
   */
  const startRequest = (): void => {
    isFetchingRef.current = true;
    lastFetchTimeRef.current = Date.now();
  };
  
  /**
   * Updates the timestamp of the last successful request
   */
  const completeRequest = (): void => {
    lastFetchTimeRef.current = Date.now();
    isFetchingRef.current = false;
  };
  
  /**
   * Marks request as finished but without updating the timestamp
   * (used for failed requests)
   */
  const resetRequestState = (): void => {
    isFetchingRef.current = false;
  };
  
  return {
    lastFetchTimeRef,
    isFetchingRef,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState
  };
};
