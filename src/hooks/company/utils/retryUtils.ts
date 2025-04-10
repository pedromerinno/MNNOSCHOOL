
/**
 * Retry an operation multiple times with exponential backoff
 * 
 * @param operation The async operation to retry
 * @param maxRetries Maximum number of retry attempts
 * @returns The result of the operation
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} of ${maxRetries}`);
      }
      
      // Execute the operation
      const result = await operation();
      return result;
    } catch (err) {
      console.error(`Fetch attempt ${attempt + 1} failed:`, err);
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * (2 ** attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript needs it
  throw new Error('Retry failed');
};
