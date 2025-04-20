
import { useCallback } from "react";

export const useCompanyRetry = () => {
  const MAX_RETRY_ATTEMPTS = 0; // No retries by default to prevent cascading failures
  
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRY_ATTEMPTS
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[Company Retry] Retry attempt ${attempt} of ${maxRetries}`);
        }
        
        const result = await operation();
        return result;
      } catch (err) {
        console.error(`[Company Retry] Fetch attempt ${attempt + 1} failed:`, err);
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = Math.min(1000 * (2 ** attempt), 5000); 
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Retry failed');
  }, []);

  return { executeWithRetry };
};
