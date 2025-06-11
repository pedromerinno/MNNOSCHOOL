
import { useState, useCallback } from 'react';
import { Discussion } from '@/types/discussions';

interface CacheData {
  discussions: Discussion[];
  timestamp: number;
  companyId: string;
  totalCount: number;
  hasMore: boolean;
}

const CACHE_KEY = 'discussions_cache';
const CACHE_EXPIRATION = 3 * 60 * 1000; // Reduzido para 3 minutos para dados mais frescos

export const useDiscussionsCache = () => {
  const getCachedData = useCallback((companyId: string): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now - data.timestamp < CACHE_EXPIRATION && data.companyId === companyId) {
        console.log('Using cached discussions data');
        return data;
      }
      
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedData = useCallback((companyId: string, discussions: Discussion[], totalCount: number, hasMore: boolean) => {
    try {
      // Cache apenas as primeiras discussões para não sobrecarregar o localStorage
      const discussionsToCache = discussions.length > 20 ? discussions.slice(0, 20) : discussions;
      
      const data: CacheData = {
        discussions: discussionsToCache,
        timestamp: Date.now(),
        companyId,
        totalCount,
        hasMore
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching discussions:', error);
      // Se o localStorage estiver cheio, limpe o cache antigo
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
};
