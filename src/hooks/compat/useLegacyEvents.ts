
import { useEffect } from "react";
import { eventService, EVENTS } from "@/services";

/**
 * Hook para compatibilidade com o sistema de eventos antigo (baseado em eventos DOM)
 * Este hook cria mapeamentos bidirecionais entre os eventos do EventService e eventos DOM
 */
export const useLegacyEventsCompat = () => {
  useEffect(() => {
    // Mapeamento de eventos EventService -> DOM
    const mapServiceToDOM = (event: string) => {
      const handler = (detail: any) => {
        window.dispatchEvent(new CustomEvent(event, { detail }));
      };
      return handler;
    };

    // Mapeamento de eventos DOM -> EventService
    const mapDOMToService = (event: string, targetServiceEvent: string) => {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent;
        eventService.dispatch(targetServiceEvent, customEvent.detail);
      };
      return handler;
    };

    // Registrar handlers bidirecionais para cada evento
    const registerBidirectionalHandlers = (serviceEvent: string, domEvent: string) => {
      const serviceToDOM = mapServiceToDOM(domEvent);
      const domToService = mapDOMToService(domEvent, serviceEvent);
      
      eventService.on(serviceEvent, serviceToDOM, useLegacyEventsCompat);
      window.addEventListener(domEvent, domToService);
      
      return () => {
        window.removeEventListener(domEvent, domToService);
      };
    };

    // Criar handlers para cada evento comum
    const cleanupHandlers = [
      registerBidirectionalHandlers(EVENTS.COMPANY_SELECTED, 'company-selected'),
      registerBidirectionalHandlers(EVENTS.COMPANY_UPDATED, 'company-updated'),
      registerBidirectionalHandlers(EVENTS.COMPANY_RELATION_CHANGED, 'company-relation-changed'),
      registerBidirectionalHandlers(EVENTS.FORCE_RELOAD_COMPANIES, 'force-reload-companies'),
      registerBidirectionalHandlers(EVENTS.USER_PROFILE_UPDATED, 'user-profile-updated'),
      registerBidirectionalHandlers(EVENTS.NOTIFICATION_RECEIVED, 'notification-received'),
      registerBidirectionalHandlers(EVENTS.NOTIFICATIONS_READ, 'notifications-read'),
    ];
    
    // Limpar todos os handlers quando o componente é desmontado
    return () => {
      eventService.clearListeners(useLegacyEventsCompat);
      cleanupHandlers.forEach(cleanup => cleanup());
    };
  }, []);
};
