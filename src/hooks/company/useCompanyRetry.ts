
/**
 * Hook for handling retry logic when fetching company data
 */
export const useCompanyRetry = () => {
  // Maximum number of retries when fetch fails
  const MAX_RETRY_ATTEMPTS = 2; // Reduced from 3 to limit API calls

  /**
   * Execute an operation with retry logic
   * @param operation The async operation to execute with retry
   * @param maxRetries Maximum number of retry attempts (defaults to MAX_RETRY_ATTEMPTS)
   * @returns Promise with the operation result
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRY_ATTEMPTS
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[Company Retry] Retry attempt ${attempt} of ${maxRetries}`);
        }
        
        // Execute the operation
        const result = await operation();
        return result;
      } catch (err) {
        console.error(`[Company Retry] Fetch attempt ${attempt + 1} failed:`, err);
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff with larger delays)
        const delay = Math.min(2000 * (2 ** attempt), 15000); // Increased delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never happen due to the throw in the loop, but TypeScript needs it
    throw new Error('Retry failed');
  };

  return { executeWithRetry };
};
