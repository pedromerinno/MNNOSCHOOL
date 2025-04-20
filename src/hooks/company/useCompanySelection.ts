
import { useCallback } from "react";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      // First update local storage with company info
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      console.log(`Company selection being persisted for ${company.nome} (${company.id})`);
      
      // First clear any existing data before changing company
      window.dispatchEvent(new Event('company-changing'));
      
      // Add a short delay to ensure cleanup happens first
      setTimeout(() => {
        // Then update the app state
        setSelectedCompany(company);
        
        // Dispatch primary event for general app updates with the company in the payload
        window.dispatchEvent(new CustomEvent('company-selected', { 
          detail: { company } 
        }));
        
        // Increased delay for content reload events to ensure the company selection is processed
        setTimeout(() => {
          // Force reload all content for the new company
          window.dispatchEvent(new CustomEvent('reload-company-videos', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-documents', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-roles', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-courses', {
            detail: { companyId: company.id }
          }));
          
          toast.success(`Empresa ${company.nome} selecionada`, {
            description: "Conteúdo atualizado para a empresa selecionada"
          });
          
          console.log(`Content reload events dispatched for ${company.nome}`);
        }, 300); // Increased from 200ms to 300ms
      }, 200); // Increased from 100ms to 200ms
    } catch (e) {
      console.error('Failed to persist company selection', e);
      toast.error("Erro ao selecionar empresa", {
        description: "Tente novamente em alguns instantes"
      });
    }
  }, [setSelectedCompany]);

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
  
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    
    // IMPORTANT: Persist selection first which will handle state updates and events
    persistCompanySelection(company);
  }, [persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany,
    persistCompanySelection
  };
};
