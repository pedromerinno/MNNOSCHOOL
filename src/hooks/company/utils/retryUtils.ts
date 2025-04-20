
/**
 * Retry a function that returns a promise
 * @param operation Function that returns a promise
 * @param maxRetries Maximum number of retries
 * @param delay Delay between retries in ms (default: 1000)
 * @returns Promise with the result of the operation
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Operation failed, attempt ${i + 1} of ${maxRetries}`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after multiple retries');
};
