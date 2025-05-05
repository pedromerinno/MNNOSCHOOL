
import { useEffect } from "react";
import { Company } from "@/types/company";
import { eventService, EVENTS } from "@/services/EventService";

export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  useEffect(() => {
    // Função de callback para o evento de seleção de empresa
    const handleCompanySelected = (company: Company) => {
      setSelectedCompany(company);
    };

    // Registra o listener de evento
    eventService.on(EVENTS.COMPANY_SELECTED, handleCompanySelected, useCompanyEvents);
    
    // Limpa o listener ao desmontar
    return () => {
      eventService.clearListeners(useCompanyEvents);
    };
  }, [setSelectedCompany]);
  
  // Função para disparar o evento de seleção de empresa
  const dispatchCompanySelected = (company: Company) => {
    eventService.dispatch(EVENTS.COMPANY_SELECTED, company);
  };
  
  // Função para disparar o evento de alteração de relação de empresa
  const dispatchCompanyRelationChanged = () => {
    eventService.dispatch(EVENTS.COMPANY_RELATION_CHANGED, {});
  };
  
  // Função para disparar o evento de atualização de empresa
  const dispatchCompanyUpdated = (company: Company) => {
    eventService.dispatch(EVENTS.COMPANY_UPDATED, { company });
  };
  
  // Função para disparar o evento de forçar recarregamento de empresas
  const dispatchForceReloadCompanies = () => {
    eventService.dispatch(EVENTS.FORCE_RELOAD_COMPANIES, {});
  };
  
  return {
    dispatchCompanySelected,
    dispatchCompanyRelationChanged,
    dispatchCompanyUpdated,
    dispatchForceReloadCompanies
  };
};
