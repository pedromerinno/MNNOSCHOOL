
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 0
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      if (attempt === maxRetries) throw lastError;
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (2 ** attempt), 5000)));
    }
  }
  
  throw new Error('Retry failed');
};
