
import { useCallback, useEffect } from "react";
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
  
  // Manipulador para forçar a atualização dos dados da empresa
  const handleForceRefresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('[useCompanyEvents] Forcing refresh of companies');
      // Invalidar cache antes de forçar atualização
      invalidateCache();
      await forceGetUserCompanies(userId);
      toast.success('Empresas atualizadas com sucesso!');
    } catch (error) {
      console.error('[useCompanyEvents] Error refreshing companies:', error);
      toast.error('Erro ao atualizar empresas');
    }
  }, [userId, forceGetUserCompanies, invalidateCache]);
  
  // Ouvir eventos de atualização da empresa
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{company: Company}>;
      const company = customEvent.detail?.company;
      
      if (company?.nome && setDisplayName) {
        console.log(`[useCompanyEvents] Company updated/selected: ${company.nome}`);
        setDisplayName(company.nome);
      }
    };
    
    const handleCompanyRelationChange = () => {
      if (userId) {
        console.log('[useCompanyEvents] Company relation changed, refreshing companies');
        // Invalidar cache antes de forçar atualização
        invalidateCache();
        forceGetUserCompanies(userId).catch(err => {
          console.error('[useCompanyEvents] Error refreshing companies after relation change:', err);
        });
      }
    };
    
    // Registrar todos os eventos relacionados à empresa
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
    };
  }, [userId, forceGetUserCompanies, setDisplayName, handleForceRefresh, invalidateCache]);
  
  // Expor método para despachar eventos
  const dispatchCompanyEvent = useCallback((eventName: string, company: Company) => {
    // Invalidar cache antes de despachar eventos para garantir atualização completa
    invalidateCache();
    
    const event = new CustomEvent(eventName, {
      detail: { company }
    });
    window.dispatchEvent(event);
  }, [invalidateCache]);
  
  return {
    dispatchCompanyEvent,
    forceRefresh: handleForceRefresh,
    invalidateCache
  };
};
