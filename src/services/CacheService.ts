
/**
 * Serviço centralizado para gerenciamento de cache na aplicação
 * Padroniza o armazenamento e recuperação de dados em cache com TTL configurável
 */

interface CacheOptions {
  /** Chave única do cache */
  key: string;
  /** Tempo de expiração em minutos (padrão: 30) */
  expirationMinutes?: number;
  /** Namespace para agrupar caches relacionados (opcional) */
  namespace?: string;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheData<any>> = new Map();

  private constructor() {
    // Singleton
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Constrói a chave completa de cache
   * @param options Opções de cache
   * @returns Chave formatada 
   */
  private buildKey(options: CacheOptions): string {
    return options.namespace 
      ? `${options.namespace}:${options.key}`
      : options.key;
  }

  /**
   * Armazena dados em cache
   * @param options Opções de cache
   * @param data Dados a serem armazenados
   */
  public set<T>(options: CacheOptions, data: T): void {
    try {
      const fullKey = this.buildKey(options);
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
      };
      
      // Armazena em memória para acesso rápido
      this.memoryCache.set(fullKey, cacheData);
      
      // Também armazena no localStorage para persistência
      localStorage.setItem(fullKey, JSON.stringify(cacheData));
      console.log(`[CacheService] Dados armazenados para chave: ${fullKey}`);
    } catch (e) {
      console.error('[CacheService] Erro ao armazenar dados:', e);
      this.clear({ key: options.key, namespace: options.namespace });
    }
  }
  
  /**
   * Recupera dados do cache
   * @param options Opções de cache
   * @returns Dados armazenados ou null se não encontrados ou expirados
   */
  public get<T>(options: CacheOptions): T | null {
    try {
      const fullKey = this.buildKey(options);
      const { expirationMinutes = 30 } = options;
      
      // Primeiro tenta obter da memória para melhor performance
      let cacheData = this.memoryCache.get(fullKey) as CacheData<T> | undefined;
      
      // Se não encontrar na memória, busca no localStorage
      if (!cacheData) {
        const cached = localStorage.getItem(fullKey);
        if (!cached) return null;
        
        cacheData = JSON.parse(cached) as CacheData<T>;
        
        // Atualiza o cache em memória
        this.memoryCache.set(fullKey, cacheData);
      }
      
      const now = Date.now();
      const minutesSinceCache = (now - cacheData.timestamp) / (1000 * 60);
      
      if (minutesSinceCache > expirationMinutes) {
        console.log(`[CacheService] Dados expirados para chave: ${fullKey}`);
        this.clear({ key: options.key, namespace: options.namespace });
        return null;
      }
      
      console.log(`[CacheService] Dados recuperados para chave: ${fullKey}`);
      return cacheData.data;
    } catch (e) {
      console.error('[CacheService] Erro ao recuperar dados:', e);
      this.clear({ key: options.key, namespace: options.namespace });
      return null;
    }
  }
  
  /**
   * Limpa dados em cache
   * @param options Opções de cache
   */
  public clear(options: CacheOptions): void {
    try {
      const fullKey = this.buildKey(options);
      this.memoryCache.delete(fullKey);
      localStorage.removeItem(fullKey);
      console.log(`[CacheService] Dados limpos para chave: ${fullKey}`);
    } catch (e) {
      console.error('[CacheService] Erro ao limpar cache:', e);
    }
  }
  
  /**
   * Limpa todos os caches de um namespace
   * @param namespace Namespace para limpar
   */
  public clearNamespace(namespace: string): void {
    try {
      // Limpa da memória
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${namespace}:`)) {
          this.memoryCache.delete(key);
        }
      }
      
      // Limpa do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${namespace}:`)) {
          localStorage.removeItem(key);
        }
      }
      
      console.log(`[CacheService] Todos os dados do namespace ${namespace} foram limpos`);
    } catch (e) {
      console.error('[CacheService] Erro ao limpar namespace:', e);
    }
  }
}

// Exporta a instância singleton
export const cacheService = CacheService.getInstance();
