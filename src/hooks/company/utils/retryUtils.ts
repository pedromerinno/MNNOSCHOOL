
/**
 * Retry a function that returns a promise with exponential backoff
 * @param operation Function that returns a promise
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay between retries in ms (default: 1000)
 * @param maxDelay Maximum delay between retries in ms (default: 10000)
 * @returns Promise with the result of the operation
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number,
  initialDelay = 1000,
  maxDelay = 10000
): Promise<T> => {
  let lastError: Error | null = null;
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Operation failed, attempt ${i + 1} of ${maxRetries}`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's a connection/network error
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_CONNECTION_CLOSED') ||
        errorMessage.includes('AbortError');
      
      lastError = error instanceof Error 
        ? error 
        : new Error(isNetworkError ? 'Network connection error' : 'Unknown error');
      
      if (i < maxRetries - 1) {
        // Use exponential backoff with jitter for retries
        const jitter = Math.random() * 300;
        delay = Math.min(delay * 1.5 + jitter, maxDelay);
        console.log(`Retrying in ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after multiple retries');
};
