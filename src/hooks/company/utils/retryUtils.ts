
/**
 * Retry an operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  factor = 2
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    console.log(`Retrying operation in ${delay}ms, ${retries} retries left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryOperation(operation, retries - 1, delay * factor, factor);
  }
};
