
import { useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expirationMinutes: number;
}

export const useOptimizedCache = () => {
  const setCache = useCallback(<T>(key: string, data: T, expirationMinutes: number = 15) => {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expirationMinutes
      };
      
      // Limitar tamanho do item no cache
      const serialized = JSON.stringify(item);
      if (serialized.length > 1024 * 1024) { // 1MB limit
        console.warn(`Cache item ${key} is too large, skipping`);
        return;
      }
      
      localStorage.setItem(`cache_${key}`, serialized);
    } catch (error) {
      console.warn(`Failed to cache ${key}:`, error);
      // Tentar limpar cache antigo se falhar
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch {}
    }
  }, []);

  const getCache = useCallback(<T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const item: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      const expirationTime = item.timestamp + (item.expirationMinutes * 60 * 1000);

      if (now > expirationTime) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn(`Failed to get cache ${key}:`, error);
      // Limpar cache corrompido
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch {}
      return null;
    }
  }, []);

  const clearCache = useCallback((key: string) => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn(`Failed to clear cache ${key}:`, error);
    }
  }, []);

  const clearAllCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }, []);

  return { setCache, getCache, clearCache, clearAllCache };
};
