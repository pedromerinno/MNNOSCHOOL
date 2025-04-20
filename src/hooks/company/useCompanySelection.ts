
import { useCallback } from "react";
import { Company } from "@/types/company";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      // Disparar eventos para atualizar diferentes partes da aplicação
      window.dispatchEvent(new CustomEvent('company-selected', { 
        detail: { company } 
      }));
      
      // Evento específico para forçar recarregamento dos vídeos
      window.dispatchEvent(new CustomEvent('reload-company-videos', {
        detail: { companyId: company.id }
      }));
      
      // Evento para recarregar documentos da empresa
      window.dispatchEvent(new CustomEvent('reload-company-documents', {
        detail: { companyId: company.id }
      }));
      
      // Evento para recarregar cargos da empresa
      window.dispatchEvent(new CustomEvent('reload-company-roles', {
        detail: { companyId: company.id }
      }));
      
      // Evento para recarregar cursos da empresa
      window.dispatchEvent(new CustomEvent('reload-company-courses', {
        detail: { companyId: company.id }
      }));
      
      console.log(`Company selection persisted and events dispatched for ${company.nome}`);
    } catch (e) {
      console.error('Failed to persist company selection', e);
    }
  }, []);

  const getStoredCompanyId = useCallback((): string | null => {
    return localStorage.getItem('selectedCompanyId');
  }, []);

  const getStoredCompany = useCallback((): Company | null => {
    const storedCompany = localStorage.getItem('selectedCompany');
    if (!storedCompany) return null;
    
    try {
      return JSON.parse(storedCompany) as Company;
    } catch (e) {
      console.error('Error parsing stored company', e);
      return null;
    }
  }, []);

  let lastSelectedCompanyId: string | null = null;
  
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    // Evitar seleções duplicadas
    if (lastSelectedCompanyId === company.id) {
      console.log(`Company ${company.nome} already selected, skipping`);
      return;
    }
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    
    // Atualizar último ID selecionado
    lastSelectedCompanyId = company.id;
    
    // Atualizar estado e persistir seleção
    setSelectedCompany(company);
    persistCompanySelection(company);
  }, [setSelectedCompany, persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
