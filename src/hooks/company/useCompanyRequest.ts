
import { useRef, useCallback } from 'react';

export const useCompanyRequest = () => {
  const pendingRequestsRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);
  
  const startRequest = useCallback(() => {
    pendingRequestsRef.current++;
    lastRequestTimeRef.current = Date.now();
  }, []);
  
  const completeRequest = useCallback(() => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
  }, []);
  
  const resetRequestState = useCallback(() => {
    pendingRequestsRef.current = 0;
  }, []);
  
  const shouldMakeRequest = useCallback((
    forceRefresh: boolean, 
    hasExistingData: boolean
  ): boolean => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    const THROTTLE_MS = 1000; // 1 second
    
    // Always make request if forced
    if (forceRefresh) return true;
    
    // Don't make request if one is already in progress and not forced
    if (pendingRequestsRef.current > 0) return false;
    
    // Throttle requests
    if (timeSinceLastRequest < THROTTLE_MS && hasExistingData) return false;
    
    return true;
  }, []);
  
  return {
    pendingRequestsRef,
    startRequest,
    completeRequest,
    resetRequestState,
    shouldMakeRequest
  };
};
