
/**
 * Helper function to retry failed fetch operations with exponential backoff
 */
export const retryOperation = async (operation: () => Promise<any>, maxRetries = 2, initialDelay = 500) => {
  let lastError;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Adicionar um jitter (variação aleatória) para evitar thundering herd
        const jitter = Math.random() * 200;
        const backoffDelay = delay + jitter;
        
        console.log(`Aguardando ${Math.round(backoffDelay)}ms antes da próxima tentativa`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        // Increase delay for next retry (exponential backoff)
        delay *= 1.5;
      }
    }
  }
  
  // If all retries fail, throw the last error
  throw lastError;
};

/**
 * Retry operation with timeout to prevent long-running operations
 */
export const retryWithTimeout = async (
  operation: () => Promise<any>, 
  maxRetries = 2, 
  initialDelay = 500,
  timeout = 5000
) => {
  return Promise.race([
    retryOperation(operation, maxRetries, initialDelay),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    })
  ]);
};
