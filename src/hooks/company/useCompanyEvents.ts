
import { useEffect } from "react";
import { Company } from "@/types/company";
import { eventService, EVENTS } from "@/services";

export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  useEffect(() => {
    // Função de callback para o evento de seleção de empresa
    const handleCompanySelected = (company: Company) => {
      console.log("[useCompanyEvents] Empresa selecionada via evento:", company.nome);
      setSelectedCompany(company);
    };

    // Registra o listener de evento
    eventService.on(EVENTS.COMPANY_SELECTED, handleCompanySelected, useCompanyEvents);
    
    // Também registra o listener para eventos DOM legados
    const handleLegacyCompanySelectedEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.company) {
        console.log("[useCompanyEvents] Empresa selecionada via evento DOM legado:", customEvent.detail.company.nome);
        setSelectedCompany(customEvent.detail.company);
      }
    };
    
    window.addEventListener('company-selected', handleLegacyCompanySelectedEvent);
    
    // Limpa os listeners ao desmontar
    return () => {
      eventService.clearListeners(useCompanyEvents);
      window.removeEventListener('company-selected', handleLegacyCompanySelectedEvent);
    };
  }, [setSelectedCompany]);
  
  // Função para disparar o evento de seleção de empresa
  const dispatchCompanySelected = (company: Company) => {
    console.log("[useCompanyEvents] Disparando evento de seleção de empresa:", company.nome);
    eventService.dispatch(EVENTS.COMPANY_SELECTED, company);
  };
  
  // Função para disparar o evento de alteração de relação de empresa
  const dispatchCompanyRelationChanged = () => {
    console.log("[useCompanyEvents] Disparando evento de alteração de relação de empresa");
    eventService.dispatch(EVENTS.COMPANY_RELATION_CHANGED, {});
  };
  
  // Função para disparar o evento de atualização de empresa
  const dispatchCompanyUpdated = (company: Company) => {
    console.log("[useCompanyEvents] Disparando evento de atualização de empresa:", company.nome);
    eventService.dispatch(EVENTS.COMPANY_UPDATED, { company });
  };
  
  // Função para disparar o evento de forçar recarregamento de empresas
  const dispatchForceReloadCompanies = () => {
    console.log("[useCompanyEvents] Disparando evento para forçar recarregamento de empresas");
    eventService.dispatch(EVENTS.FORCE_RELOAD_COMPANIES, {});
  };
  
  return {
    dispatchCompanySelected,
    dispatchCompanyRelationChanged,
    dispatchCompanyUpdated,
    dispatchForceReloadCompanies
  };
};
