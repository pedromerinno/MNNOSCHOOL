
/**
 * Serviço centralizado para gerenciamento de eventos na aplicação
 * Permite disparar e escutar eventos de forma padronizada
 */

type EventCallback = (detail: any) => void;
type EventSubscription = { event: string; callback: EventCallback };

class EventService {
  private static instance: EventService;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private subscriptions: Map<object, EventSubscription[]> = new Map();

  private constructor() {
    // Singleton
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * Dispara um evento customizado
   * @param eventName Nome do evento
   * @param detail Detalhes do evento (payload)
   */
  public dispatch(eventName: string, detail: any): void {
    console.log(`[EventService] Disparando evento: ${eventName}`, detail);

    // Dispara o evento usando CustomEvent para compatibilidade com listeners DOM
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);

    // Também notifica listeners internos
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(detail);
        } catch (error) {
          console.error(`[EventService] Erro ao executar callback para ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Registra um listener para um evento
   * @param eventName Nome do evento
   * @param callback Função a ser chamada quando o evento for disparado
   * @param owner Objeto dono do listener (para limpeza automática)
   */
  public on(eventName: string, callback: EventCallback, owner?: object): void {
    // Adiciona ao mapa de listeners
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback);

    // Se houver um owner, registra a subscription para limpeza futura
    if (owner) {
      if (!this.subscriptions.has(owner)) {
        this.subscriptions.set(owner, []);
      }
      this.subscriptions.get(owner)?.push({ event: eventName, callback });
    }
  }

  /**
   * Remove um listener específico
   * @param eventName Nome do evento
   * @param callback Função registrada
   */
  public off(eventName: string, callback: EventCallback): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Remove todos os listeners registrados por um determinado owner
   * @param owner Objeto dono dos listeners
   */
  public clearListeners(owner: object): void {
    const subscriptions = this.subscriptions.get(owner);
    if (subscriptions) {
      subscriptions.forEach(sub => {
        this.off(sub.event, sub.callback);
      });
      this.subscriptions.delete(owner);
    }
  }

  // Constantes para eventos padrão da aplicação
  public static readonly EVENTS = {
    COMPANY_RELATION_CHANGED: 'company-relation-changed',
    COMPANY_SELECTED: 'company-selected',
    COMPANY_UPDATED: 'company-updated',
    FORCE_RELOAD_COMPANIES: 'force-reload-companies',
    USER_PROFILE_UPDATED: 'user-profile-updated',
    NOTIFICATION_RECEIVED: 'notification-received',
    NOTIFICATIONS_READ: 'notifications-read'
  };
}

// Exporta a instância singleton
export const eventService = EventService.getInstance();
export const EVENTS = EventService.EVENTS;
