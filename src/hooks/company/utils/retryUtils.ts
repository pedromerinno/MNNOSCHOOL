
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
      console.log(`Attempt ${i + 1} of ${maxRetries}...`);
      const result = await operation();
      console.log(`Operation succeeded on attempt ${i + 1}`);
      return result;
    } catch (error) {
      console.error(`Operation failed, attempt ${i + 1} of ${maxRetries}`, error);
      
      // Detectar erros específicos que podem indicar problemas temporários
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Detectar erros de rede/conexão
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_CONNECTION_CLOSED') ||
        errorMessage.includes('AbortError') ||
        errorMessage.includes('ERR_INSUFFICIENT_RESOURCES');
      
      // Detectar erros de política/recursão
      const isPolicyError =
        errorMessage.includes('recursion detected in policy') ||
        errorMessage.includes('PGRST301') ||
        errorMessage.includes('policy for relation');
      
      // Detectar erros HTTP 500
      const isServerError = 
        errorMessage.includes('500') || 
        errorMessage.includes('Internal Server Error');
      
      lastError = error instanceof Error 
        ? error 
        : new Error(isNetworkError ? 'Network connection error' : 
                   isPolicyError ? 'Database policy error' : 
                   isServerError ? 'Server error' : 'Unknown error');
      
      if (i < maxRetries - 1) {
        // Use a larger jitter and significantly longer delays
        const jitter = Math.random() * 500;
        delay = Math.min(delay * 2 + jitter, maxDelay);
        console.log(`Retrying in ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after multiple retries');
};
