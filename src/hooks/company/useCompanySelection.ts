
import { useCallback } from "react";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      // Prevent multiple selection events in quick succession
      const lastSelectionTime = localStorage.getItem('lastCompanySelectionTime');
      const now = Date.now();
      
      if (lastSelectionTime && (now - parseInt(lastSelectionTime, 10)) < 5000) {
        console.log("Ignoring company selection, too soon after previous selection");
        return;
      }
      
      localStorage.setItem('lastCompanySelectionTime', now.toString());
      
      // Clear all cached data first
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('userCompaniesTimestamp');
      
      // Clear all company related caches
      localStorage.removeItem('companyVideos');
      localStorage.removeItem('companyDocuments');
      localStorage.removeItem('companyCourses');
      localStorage.removeItem('companyRoles');
      
      // Then update local storage with new company info
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      console.log(`Company selection being persisted for ${company.nome} (${company.id})`);
      
      // First clear any existing data before changing company
      window.dispatchEvent(new Event('company-changing'));
      
      // Short delay to ensure cleanup happens first
      setTimeout(() => {
        // Update the app state
        setSelectedCompany(company);
        
        // Dispatch primary event for general app updates
        window.dispatchEvent(new CustomEvent('company-selected', { 
          detail: { company } 
        }));
        
        // Show feedback to user that company is changing
        toast.info(`Carregando empresa ${company.nome}...`, {
          duration: 2000
        });
        
        // Increased delay for content reload events
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
          
          // Notify success with a brief delay
          setTimeout(() => {
            toast.success(`Empresa ${company.nome} selecionada`, {
              description: "Conteúdo atualizado para a empresa selecionada"
            });
            
            console.log(`Content reload events dispatched for ${company.nome}`);
          }, 500);
          
        }, 500);
      }, 300);
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
    persistCompanySelection(company);
  }, [persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany,
    persistCompanySelection
  };
};
