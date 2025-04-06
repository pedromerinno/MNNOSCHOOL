
/**
 * Helper function to retry failed fetch operations
 */
export const retryOperation = async (operation: () => Promise<any>, maxRetries = 2, delay = 800) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, error);
      lastError = error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry (exponential backoff)
      delay *= 1.5;
    }
  }
  
  // If all retries fail, throw the last error
  throw lastError;
};
