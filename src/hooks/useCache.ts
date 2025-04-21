
interface CacheOptions {
  key: string;
  expirationMinutes?: number;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const useCache = () => {
  const setCache = <T>(options: CacheOptions, data: T): void => {
    try {
      const { key, expirationMinutes = 30 } = options;
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`[Cache] Stored data for key: ${key}`);
    } catch (e) {
      console.error('[Cache] Error storing data:', e);
      clearCache(options.key);
    }
  };
  
  const getCache = <T>(options: CacheOptions): T | null => {
    try {
      const { key, expirationMinutes = 30 } = options;
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const { data, timestamp }: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      const minutesSinceCache = (now - timestamp) / (1000 * 60);
      
      if (minutesSinceCache > expirationMinutes) {
        console.log(`[Cache] Expired data for key: ${key}`);
        clearCache(key);
        return null;
      }
      
      console.log(`[Cache] Retrieved data for key: ${key}`);
      return data;
    } catch (e) {
      console.error('[Cache] Error retrieving data:', e);
      clearCache(options.key);
      return null;
    }
  };
  
  const clearCache = (key: string): void => {
    try {
      localStorage.removeItem(key);
      console.log(`[Cache] Cleared data for key: ${key}`);
    } catch (e) {
      console.error('[Cache] Error clearing cache:', e);
    }
  };
  
  return {
    setCache,
    getCache,
    clearCache
  };
};
