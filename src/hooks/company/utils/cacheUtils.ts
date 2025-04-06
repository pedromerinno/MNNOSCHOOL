
import { CacheOptions } from "../types/fetchTypes";

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Stores data in the cache with expiration
 */
export const cacheData = <T>(data: T, options: CacheOptions): void => {
  const { cacheKey, expirationMs = 1000 * 60 * 5 } = options; // Default 5 min expiration
  
  const cachedData: CachedData<T> = {
    data,
    timestamp: Date.now() + expirationMs
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    console.warn(`Failed to cache data for key ${cacheKey}:`, error);
  }
};

/**
 * Retrieves data from cache if not expired
 */
export const getCachedData = <T>(cacheKey: string): T | null => {
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) return null;
    
    const { data, timestamp }: CachedData<T> = JSON.parse(cachedItem);
    
    // Check if cache has expired
    if (Date.now() > timestamp) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn(`Failed to retrieve cached data for key ${cacheKey}:`, error);
    return null;
  }
};

/**
 * Clears all cached data or specific keys
 */
export const clearCache = (cacheKeys?: string[]): void => {
  try {
    if (!cacheKeys) {
      // Clear all company-related cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('company') || key.includes('Company'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // Clear specific keys
      cacheKeys.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};
