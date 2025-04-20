
import { useCallback } from 'react';
import { retryOperation } from './utils/retryUtils';

export const useCompanyRetry = () => {
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    retries = 3,
    initialDelay = 1000,
    maxDelay = 10000
  ): Promise<T> => {
    return await retryOperation(operation, retries, initialDelay, maxDelay);
  }, []);
  
  return { executeWithRetry };
};
