
import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';

// Esta função agora está dentro do hook personalizado
export const useCompanyEvents = () => {
  const eventTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastTriggeredRef = useRef<Record<string, number>>({});
  const MIN_EVENT_INTERVAL = 500; // Mínimo intervalo entre eventos em ms

  // useCallback deve estar dentro de um hook ou componente funcional
  const triggerCompanyEvent = useCallback((eventName: string, detail: any = {}) => {
    const now = Date.now();
    const lastTriggered = lastTriggeredRef.current[eventName] || 0;
    
    // Evitar disparos múltiplos do mesmo evento em um curto período
    if (now - lastTriggered < MIN_EVENT_INTERVAL) {
      console.log(`[useCompanyEvents] Evento "${eventName}" ignorado (throttled)`);
      return;
    }
    
    // Limpar timeout anterior se existir
    if (eventTimeoutsRef.current[eventName]) {
      clearTimeout(eventTimeoutsRef.current[eventName]);
    }
    
    // Registrar o último disparo
    lastTriggeredRef.current[eventName] = now;
    
    // Usar debounce para eventos que podem ser disparados rapidamente
    const debouncedDispatch = debounce(() => {
      const event = new CustomEvent(eventName, { detail });
      console.log(`[useCompanyEvents] Disparando evento: ${eventName}`, detail);
      window.dispatchEvent(event);
    }, 100);
    
    debouncedDispatch();
  }, []);

  return {
    triggerCompanyEvent
  };
};
