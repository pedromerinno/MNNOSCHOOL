
import { useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expirationMinutes: number;
}

export const useOptimizedCache = () => {
  const clearExpiredCacheRef = useCallback(() => {
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

  const setCache = useCallback(<T>(key: string, data: T, expirationMinutes: number = 15) => {
    const MAX_SIZE = 200 * 1024; // 200KB para dar margem de segurança
    
    try {
      let processedData: T = data;
      
      // Função auxiliar para reduzir tamanho do conteúdo em objetos
      const reduceContentSize = (obj: any, maxLength: number = 500): any => {
        if (typeof obj !== 'object' || obj === null) {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map(item => reduceContentSize(item, maxLength));
        }

        const reduced: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'content' && typeof value === 'string' && value.length > maxLength) {
            // Truncar conteúdo muito grande
            reduced[key] = value.substring(0, maxLength) + '...';
          } else if (key === 'title' && typeof value === 'string' && value.length > 200) {
            // Truncar títulos muito longos
            reduced[key] = value.substring(0, 200) + '...';
          } else if (Array.isArray(value)) {
            // Limitar arrays grandes
            reduced[key] = value.slice(0, 10).map((item: any) => 
              typeof item === 'object' && item !== null 
                ? reduceContentSize(item, maxLength) 
                : item
            );
          } else {
            reduced[key] = typeof value === 'object' && value !== null
              ? reduceContentSize(value, maxLength)
              : value;
          }
        }
        return reduced;
      };

      const item: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        expirationMinutes
      };
      
      let serialized = JSON.stringify(item);
      
      // Se já está dentro do limite, armazenar diretamente
      if (serialized.length <= MAX_SIZE) {
        try {
          localStorage.setItem(`cache_${key}`, serialized);
          return;
        } catch (error: any) {
          if (error.name === 'QuotaExceededError') {
            clearExpiredCacheRef();
          }
          throw error;
        }
      }
      
      let attempts = 0;
      const maxAttempts = 5;

      // Reduzir progressivamente até caber no limite
      while (serialized.length > MAX_SIZE && attempts < maxAttempts) {
        attempts++;
        const sizeBefore = serialized.length;
        
        if (Array.isArray(processedData)) {
          // Reduzir número de itens
          const currentLength = (processedData as any[]).length;
          const targetLength = Math.max(1, Math.floor(currentLength * 0.7));
          processedData = (processedData as any[]).slice(0, targetLength) as T;
        }
        
        // Reduzir tamanho do conteúdo dentro dos itens
        const maxContentLength = Math.max(200, 500 - (attempts * 100));
        processedData = reduceContentSize(processedData, maxContentLength) as T;
        
        const newItem: CacheItem<T> = {
          data: processedData,
          timestamp: Date.now(),
          expirationMinutes
        };
        
        serialized = JSON.stringify(newItem);
        const sizeAfter = serialized.length;
        
        // Se não reduziu significativamente, parar tentativas
        if (sizeAfter >= sizeBefore * 0.9) {
          console.warn(`[Cache] Não foi possível reduzir ${key} suficientemente após ${attempts} tentativas`);
          break;
        }
      }

      // Se ainda for muito grande, não armazenar (apenas uma vez por key)
      if (serialized.length > MAX_SIZE) {
        // Verificar se já removemos este item antes para evitar logs repetidos
        const existingItem = localStorage.getItem(`cache_${key}`);
        if (existingItem) {
          localStorage.removeItem(`cache_${key}`);
        }
        // Log apenas se for realmente um problema (não repetir)
        if (!localStorage.getItem(`cache_warned_${key}`)) {
          console.warn(`[Cache] Item ${key} muito grande (${Math.round(serialized.length / 1024)}KB), não armazenando no cache`);
          // Marcar como avisado por 1 minuto
          localStorage.setItem(`cache_warned_${key}`, Date.now().toString());
          setTimeout(() => {
            localStorage.removeItem(`cache_warned_${key}`);
          }, 60000);
        }
        return;
      }

      if (attempts > 0) {
        console.warn(`[Cache] Item ${key} reduzido após ${attempts} tentativas (${serialized.length} bytes)`);
      }

      localStorage.setItem(`cache_${key}`, serialized);
    } catch (error: any) {
      console.warn(`[Cache] Falha ao armazenar ${key}:`, error.message);
      
      // Se falhar por quota, tentar limpar cache antigo
      if (error.name === 'QuotaExceededError') {
        console.log('[Cache] Quota excedida, limpando cache antigo...');
        try {
          clearExpiredCacheRef();
          
          // Tentar novamente com dados muito reduzidos
          if (Array.isArray(data)) {
            const reducedData = data.slice(0, 1).map(item => {
              if (typeof item === 'object' && item !== null) {
                const reduced: any = {};
                for (const [key, value] of Object.entries(item)) {
                  if (key === 'content' && typeof value === 'string') {
                    reduced[key] = value.substring(0, 100) + '...';
                  } else {
                    reduced[key] = value;
                  }
                }
                return reduced;
              }
              return item;
            });
            
            try {
              const reducedItem: CacheItem<T> = {
                data: reducedData as T,
                timestamp: Date.now(),
                expirationMinutes
              };
              const serialized = JSON.stringify(reducedItem);
              if (serialized.length <= MAX_SIZE) {
                localStorage.setItem(`cache_${key}`, serialized);
                console.log(`[Cache] Armazenou versão mínima de ${key}`);
              } else {
                console.warn(`[Cache] Não foi possível armazenar ${key} mesmo após redução máxima`);
                localStorage.removeItem(`cache_${key}`);
              }
            } catch {
              localStorage.removeItem(`cache_${key}`);
            }
          }
        } catch (retryError) {
          console.warn(`[Cache] Falha na segunda tentativa:`, retryError);
          localStorage.removeItem(`cache_${key}`);
        }
      }
    }
  }, [clearExpiredCacheRef]);

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

      // Log removido para reduzir ruído no console
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
      // Log removido para reduzir ruído no console
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
