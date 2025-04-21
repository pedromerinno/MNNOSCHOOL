
import { useCallback, useEffect, useRef } from "react";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { useCompanyCache } from "./useCompanyCache";

export interface UseCompanyEventsProps {
  userId: string | undefined;
  forceGetUserCompanies: (userId: string) => Promise<any>;
  setDisplayName?: (name: string) => void;
}

export const useCompanyEvents = ({
  userId,
  forceGetUserCompanies,
  setDisplayName
}: UseCompanyEventsProps) => {
  const { invalidateCache } = useCompanyCache();
  const isProcessingRef = useRef(false);
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Manipulador para forçar a atualização dos dados da empresa
  const handleForceRefresh = useCallback(async () => {
    if (!userId || isProcessingRef.current) return;
    
    try {
      isProcessingRef.current = true;
      console.log('[useCompanyEvents] Forcing refresh of companies');
      // Invalidar cache antes de forçar atualização
      invalidateCache();
      await forceGetUserCompanies(userId);
      toast.success('Empresas atualizadas com sucesso!');
    } catch (error) {
      console.error('[useCompanyEvents] Error refreshing companies:', error);
      toast.error('Erro ao atualizar empresas');
    } finally {
      isProcessingRef.current = false;
    }
  }, [userId, forceGetUserCompanies, invalidateCache]);
  
  // Ouvir eventos de atualização da empresa com debounce para evitar múltiplas chamadas
  const handleCompanyUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{company: Company}>;
    const company = customEvent.detail?.company;
    
    if (company?.nome && setDisplayName) {
      console.log(`[useCompanyEvents] Company updated/selected: ${company.nome}`);
      setDisplayName(company.nome);
    }
  }, [setDisplayName]);
  
  const handleCompanyRelationChange = useCallback(() => {
    if (!userId || isProcessingRef.current) return;
    
    // Usar debounce para evitar múltiplas chamadas
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current);
    }
    
    eventTimeoutRef.current = setTimeout(() => {
      console.log('[useCompanyEvents] Company relation changed, refreshing companies');
      // Invalidar cache antes de forçar atualização
      invalidateCache();
      
      isProcessingRef.current = true;
      forceGetUserCompanies(userId)
        .catch(err => {
          console.error('[useCompanyEvents] Error refreshing companies after relation change:', err);
        })
        .finally(() => {
          isProcessingRef.current = false;
        });
    }, 300);
  }, [userId, forceGetUserCompanies, invalidateCache]);
  
  // Registrar todos os eventos relacionados à empresa
  useEffect(() => {
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('force-reload-companies', handleForceRefresh);
    window.addEventListener('invalidate-cache', invalidateCache);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('force-reload-companies', handleForceRefresh);
      window.removeEventListener('invalidate-cache', invalidateCache);
      
      // Limpar timeout pendente
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
      }
    };
  }, [handleCompanyUpdate, handleCompanyRelationChange, handleForceRefresh, invalidateCache]);
  
  // Expor método para despachar eventos com debounce
  const dispatchCompanyEvent = useCallback((eventName: string, company: Company) => {
    // Usar debounce para evitar múltiplos eventos
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current);
    }
    
    eventTimeoutRef.current = setTimeout(() => {
      // Invalidar cache antes de despachar eventos para garantir atualização completa
      invalidateCache();
      
      const event = new CustomEvent(eventName, {
        detail: { company }
      });
      window.dispatchEvent(event);
    }, 300);
  }, [invalidateCache]);
  
  return {
    dispatchCompanyEvent,
    forceRefresh: handleForceRefresh,
    invalidateCache
  };
};
