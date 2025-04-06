
import { FetchError, RetryOptions } from "../types/fetchTypes";

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 800,
  backoffFactor: 1.5,
  shouldRetry: () => true
};

/**
 * Enhanced helper function to retry failed fetch operations with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>, 
  options?: Partial<RetryOptions>
): Promise<T> => {
  const config = { ...defaultRetryOptions, ...options };
  let lastError: FetchError | null = null;
  let delay = config.initialDelay;
  
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, error);
      
      // Create a more descriptive error object
      lastError = new Error(
        error instanceof Error ? error.message : 'Unknown error during fetch'
      ) as FetchError;
      
      lastError.context = `Retry attempt ${attempt + 1} of ${config.maxRetries}`;
      lastError.originalError = error;
      lastError.retryCount = attempt + 1;
      
      // Check if we should retry this specific error
      if (!config.shouldRetry(error)) {
        console.warn(`Error not retriable, stopping retry attempts`);
        break;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry
      delay *= config.backoffFactor;
    }
  }
  
  // If all retries fail, throw the enhanced error
  throw lastError;
};

/**
 * Helper function to determine if an error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    );
  }
  return false;
};

/**
 * Helper function to determine if an error is a server error
 */
export const isServerError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }
  return false;
};
