
import { useCallback } from 'react';
import { retryOperation } from './utils/retryUtils';

export const useCompanyRetry = () => {
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> => {
    return await retryOperation(operation, retries);
  }, []);
  
  return { executeWithRetry };
};
