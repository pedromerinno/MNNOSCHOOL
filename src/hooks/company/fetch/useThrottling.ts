
export const COMPONENT_SPECIFIC_THROTTLE = 30000; // 30 seconds

export const useThrottling = () => {
  const shouldThrottle = (
    lastSuccessTime: number,
    forceRefresh: boolean,
    hasExistingData: boolean
  ): boolean => {
    if (forceRefresh) return false;
    
    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessTime;
    
    return lastSuccessTime > 0 && 
           timeSinceLastSuccess < COMPONENT_SPECIFIC_THROTTLE && 
           hasExistingData;
  };

  return { shouldThrottle };
};
