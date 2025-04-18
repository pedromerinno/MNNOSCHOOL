
import { useRef } from "react";

export const useRequestState = () => {
  // Flag to control ongoing requests
  const isFetchingRef = useRef<boolean>(false);
  const lastSuccessfulFetchRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startRequest = () => {
    isFetchingRef.current = true;
  };

  const completeRequest = () => {
    isFetchingRef.current = false;
    lastSuccessfulFetchRef.current = Date.now();
    abortControllerRef.current = null;
  };

  const resetRequest = () => {
    isFetchingRef.current = false;
    abortControllerRef.current = null;
  };

  return {
    isFetchingRef,
    lastSuccessfulFetchRef,
    abortControllerRef,
    startRequest,
    completeRequest,
    resetRequest
  };
};
