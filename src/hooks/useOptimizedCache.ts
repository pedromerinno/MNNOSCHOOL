
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
      
      const serialized = JSON.stringify(item);
      
      // Verificar tamanho antes de armazenar (limite de 256KB por item)
      if (serialized.length > 256 * 1024) {
        console.warn(`[Cache] Item ${key} é muito grande (${serialized.length} bytes), reduzindo dados...`);
        
        // Se for um array, reduzir o número de itens
        if (Array.isArray(data)) {
          const reducedData = data.slice(0, Math.min(10, data.length));
          const reducedItem: CacheItem<T> = {
            data: reducedData as T,
            timestamp: Date.now(),
            expirationMinutes
          };
          localStorage.setItem(`cache_${key}`, JSON.stringify(reducedItem));
          console.log(`[Cache] Armazenou versão reduzida de ${key} com ${reducedData.length} itens`);
        }
        return;
      }
      
      localStorage.setItem(`cache_${key}`, serialized);
      console.log(`[Cache] Armazenou ${key} com sucesso (${serialized.length} bytes)`);
    } catch (error: any) {
      console.warn(`[Cache] Falha ao armazenar ${key}:`, error.message);
      
      // Se falhar por quota, tentar limpar cache antigo
      if (error.name === 'QuotaExceededError') {
        console.log('[Cache] Quota excedida, limpando cache antigo...');
        try {
          // Limpar itens expirados
          clearExpiredCache();
          
          // Tentar novamente com dados reduzidos
          if (Array.isArray(data) && data.length > 5) {
            const reducedData = data.slice(0, 5);
            const reducedItem: CacheItem<T> = {
              data: reducedData as T,
              timestamp: Date.now(),
              expirationMinutes
            };
            localStorage.setItem(`cache_${key}`, JSON.stringify(reducedItem));
            console.log(`[Cache] Armazenou versão muito reduzida de ${key}`);
          }
        } catch (retryError) {
          console.warn(`[Cache] Falha na segunda tentativa:`, retryError);
          // Como último recurso, limpar este item específico
          localStorage.removeItem(`cache_${key}`);
        }
      }
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
        console.log(`[Cache] Item ${key} expirado, removendo...`);
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      console.log(`[Cache] Recuperou ${key} do cache`);
      return item.data;
    } catch (error) {
      console.warn(`[Cache] Falha ao recuperar ${key}:`, error);
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
      console.log(`[Cache] Limpou ${key}`);
    } catch (error) {
      console.warn(`[Cache] Falha ao limpar ${key}:`, error);
    }
  }, []);

  const clearExpiredCache = useCallback(() => {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      let cleared = 0;
      
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const item = JSON.parse(cached);
              const expirationTime = item.timestamp + (item.expirationMinutes * 60 * 1000);
              
              if (now > expirationTime) {
                localStorage.removeItem(key);
                cleared++;
              }
            }
          } catch {
            // Se não conseguir fazer parse, remover o item
            localStorage.removeItem(key);
            cleared++;
          }
        }
      });
      
      if (cleared > 0) {
        console.log(`[Cache] Limpou ${cleared} itens expirados`);
      }
    } catch (error) {
      console.warn('[Cache] Erro ao limpar cache expirado:', error);
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
      console.log('[Cache] Limpou todo o cache');
    } catch (error) {
      console.warn('[Cache] Falha ao limpar todo o cache:', error);
    }
  }, []);

  return { setCache, getCache, clearCache, clearExpiredCache, clearAllCache };
};
