
/**
 * Serviço para gerenciamento de requisições
 * Evita requisições duplicadas, implementa throttling e debouncing
 */

interface RequestOptions {
  /** ID exclusivo para a requisição */
  requestId: string;
  /** Força a execução mesmo que haja uma requisição pendente */
  force?: boolean;
  /** Namespace para agrupar requisições relacionadas */
  namespace?: string;
  /** Tempo mínimo (em ms) entre requisições do mesmo tipo */
  throttleMs?: number;
}

type DebouncedFn = (...args: any[]) => void;

class RequestService {
  private static instance: RequestService;
  private pendingRequests: Map<string, boolean> = new Map();
  private throttleTimestamps: Map<string, number> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    // Singleton
  }

  public static getInstance(): RequestService {
    if (!RequestService.instance) {
      RequestService.instance = new RequestService();
    }
    return RequestService.instance;
  }

  /**
   * Verifica se uma requisição deve ser executada
   * @param options Opções da requisição
   * @returns true se a requisição deve prosseguir, false caso contrário
   */
  public shouldMakeRequest(options: RequestOptions): boolean {
    const {
      requestId,
      force = false,
      throttleMs = 5000
    } = options;

    // Se forçado, sempre permite
    if (force) return true;

    // Verifica se já existe uma requisição pendente com o mesmo ID
    if (this.pendingRequests.get(requestId)) {
      console.log(`[RequestService] Requisição ${requestId} já está em andamento, ignorando`);
      return false;
    }

    // Verifica throttling
    const now = Date.now();
    const lastRequestTime = this.throttleTimestamps.get(requestId) || 0;
    if (now - lastRequestTime < throttleMs) {
      console.log(`[RequestService] Requisição ${requestId} limitada por throttling, ignorando`);
      return false;
    }

    return true;
  }

  /**
   * Marca o início de uma requisição
   * @param requestId ID da requisição
   */
  public startRequest(requestId: string): void {
    this.pendingRequests.set(requestId, true);
    this.throttleTimestamps.set(requestId, Date.now());
  }

  /**
   * Marca o fim de uma requisição
   * @param requestId ID da requisição
   */
  public completeRequest(requestId: string): void {
    this.pendingRequests.set(requestId, false);
  }

  /**
   * Cancela todas as requisições pendentes
   */
  public resetAllRequests(): void {
    for (const key of this.pendingRequests.keys()) {
      this.pendingRequests.set(key, false);
    }
  }

  /**
   * Cria uma função com debounce
   * @param fn Função a ser executada
   * @param delay Atraso em ms
   * @param key Chave única para identificar esta função
   * @returns Função com debounce
   */
  public debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
    key: string = 'default'
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Limpa o timer anterior se existir
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }

      // Cria um novo timer
      const timer = setTimeout(() => {
        this.debounceTimers.delete(key);
        fn(...args);
      }, delay);

      this.debounceTimers.set(key, timer);
    };
  }

  /**
   * Limpa todos os timers de debounce
   */
  public clearAllDebouncers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

// Exporta a instância singleton
export const requestService = RequestService.getInstance();
