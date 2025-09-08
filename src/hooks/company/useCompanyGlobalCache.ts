import { useRef, useCallback, useEffect } from 'react';
import { Company } from '@/types/company';

// Global cache singleton
class CompanyGlobalCache {
  private cache = new Map<string, {
    data: Company[];
    timestamp: number;
    loading: Promise<Company[]> | null;
  }>();
  
  private CACHE_DURATION = 30000; // 30 seconds
  private subscribers = new Set<(data: Company[]) => void>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup expired cache entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= this.CACHE_DURATION && !entry.loading) {
        this.cache.delete(key);
        console.log(`[CompanyGlobalCache] Auto-cleaned expired cache for ${key}`);
      }
    }
  }

  subscribe(callback: (data: Company[]) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(key: string, data: Company[]) {
    this.subscribers.forEach(callback => callback(data));
  }

  async get(
    key: string, 
    fetcher: () => Promise<Company[]>
  ): Promise<Company[]> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`[CompanyGlobalCache] Cache hit for ${key}`);
      return cached.data;
    }

    // If already loading, wait for existing promise
    if (cached?.loading) {
      console.log(`[CompanyGlobalCache] Waiting for existing request for ${key}`);
      return cached.loading;
    }

    // Start new request
    console.log(`[CompanyGlobalCache] Cache miss, fetching ${key}`);
    const loadingPromise = fetcher().then(data => {
      this.cache.set(key, {
        data,
        timestamp: now,
        loading: null
      });
      this.notify(key, data);
      return data;
    }).catch(error => {
      // Remove loading promise on error
      const current = this.cache.get(key);
      if (current) {
        this.cache.set(key, {
          ...current,
          loading: null
        });
      }
      throw error;
    });

    // Store loading promise
    this.cache.set(key, {
      data: cached?.data || [],
      timestamp: cached?.timestamp || 0,
      loading: loadingPromise
    });

    return loadingPromise;
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    console.log(`[CompanyGlobalCache] Cache invalidated for ${key || 'all'}`);
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }

  getImmediate(key: string): Company[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if ((now - cached.timestamp) >= this.CACHE_DURATION) return null;
    
    return cached.data;
  }
}

// Singleton instance
const globalCache = new CompanyGlobalCache();

export const useCompanyGlobalCache = () => {
  const subscribersRef = useRef<Set<(data: Company[]) => void>>(new Set());

  const getCachedCompanies = useCallback(
    (key: string, fetcher: () => Promise<Company[]>) => {
      return globalCache.get(key, fetcher);
    },
    []
  );

  const invalidateCache = useCallback((key?: string) => {
    globalCache.invalidate(key);
  }, []);

  const hasCache = useCallback((key: string) => {
    return globalCache.has(key);
  }, []);

  const getImmediateCache = useCallback((key: string) => {
    return globalCache.getImmediate(key);
  }, []);

  const subscribe = useCallback((callback: (data: Company[]) => void) => {
    return globalCache.subscribe(callback);
  }, []);

  return {
    getCachedCompanies,
    invalidateCache,
    hasCache,
    getImmediateCache,
    subscribe
  };
};