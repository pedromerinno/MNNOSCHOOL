
/**
 * Serviço para tratamento padronizado de erros na aplicação
 */

import { toast } from "sonner";

type ErrorHandler = (error: Error, context?: any) => void;

class ErrorService {
  private static instance: ErrorService;
  private globalHandlers: ErrorHandler[] = [];
  private domainHandlers: Map<string, ErrorHandler[]> = new Map();

  private constructor() {
    // Configura handler global
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), { 
        context: { type: 'window.onerror', event },
        showToast: true 
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      this.handleError(error, { 
        context: { type: 'unhandledRejection', event },
        showToast: true 
      });
    });
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Adiciona um manipulador de erros global
   * @param handler Função para tratar o erro
   */
  public addGlobalHandler(handler: ErrorHandler): void {
    this.globalHandlers.push(handler);
  }

  /**
   * Adiciona um manipulador de erros específico para um domínio
   * @param domain Domínio do erro (ex: 'api', 'auth', 'company')
   * @param handler Função para tratar o erro
   */
  public addDomainHandler(domain: string, handler: ErrorHandler): void {
    if (!this.domainHandlers.has(domain)) {
      this.domainHandlers.set(domain, []);
    }
    this.domainHandlers.get(domain)?.push(handler);
  }

  /**
   * Processa um erro na aplicação
   * @param error Erro ocorrido
   * @param options Opções adicionais para processamento do erro
   */
  public handleError(error: Error, options: {
    domain?: string;
    context?: any;
    showToast?: boolean;
    toastMessage?: string;
    logToConsole?: boolean;
  } = {}): void {
    const {
      domain,
      context,
      showToast = true,
      toastMessage,
      logToConsole = true
    } = options;

    // Log no console
    if (logToConsole) {
      console.error(`[ErrorService${domain ? `:${domain}` : ''}]`, error, context);
    }

    // Exibe toast se necessário
    if (showToast) {
      toast.error(toastMessage || error.message || 'Ocorreu um erro inesperado');
    }

    // Executa handlers de domínio
    if (domain && this.domainHandlers.has(domain)) {
      this.domainHandlers.get(domain)?.forEach(handler => {
        try {
          handler(error, context);
        } catch (handlerError) {
          console.error(`[ErrorService] Erro no handler de domínio ${domain}:`, handlerError);
        }
      });
    }

    // Executa handlers globais
    this.globalHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error('[ErrorService] Erro no handler global:', handlerError);
      }
    });
  }

  /**
   * Facilita o uso do try-catch com manipulação de erro já integrada
   * @param promise Promise a ser executada
   * @param options Opções para tratamento de erro
   * @returns Promise resultante
   */
  public async wrapPromise<T>(
    promise: Promise<T>, 
    options: {
      domain?: string;
      context?: any;
      showToast?: boolean;
      toastMessage?: string;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err, options);
      
      if (options.onError) {
        options.onError(err);
      }
      
      return null;
    }
  }
}

// Exporta a instância singleton
export const errorService = ErrorService.getInstance();
