
import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyUpdate } from "./useCompanyUpdate";
import { useCompanyDelete } from "./useCompanyDelete";
import { useCompanyUserRelationship } from "./useCompanyUserRelationship";
import { eventService, EVENTS } from "@/services";

interface UseCompanyModificationProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  setSelectedCompany: (company: Company | null) => void;
  setError: (error: Error | null) => void;
}

export const useCompanyModification = ({
  setIsLoading,
  setCompanies,
  setSelectedCompany,
  setError
}: UseCompanyModificationProps) => {
  
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCompanies(data as Company[]);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to fetch companies'));
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setError]);

  const selectCompany = useCallback(async (userId: string, company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', company.id);
    
    // Disparar evento com o EventService
    console.log('useCompanyModification: Disparando evento company-selected');
    eventService.dispatch(EVENTS.COMPANY_SELECTED, company);
    
    // Manter compatibilidade com o sistema antigo de eventos
    const event = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(event);
  }, [setSelectedCompany]);

  const createCompany = useCallback(async (data: Partial<Company> & { nome: string }) => {
    setIsLoading(true);
    try {
      const { data: newCompany, error } = await supabase
        .from('empresas')
        .insert(data)
        .select()
        .single();
  
      if (error) throw error;
  
      if (newCompany) {
        setCompanies(prevCompanies => [...prevCompanies, newCompany as Company]);
        toast.success(`Empresa ${newCompany.nome} criada com sucesso!`);
        
        // Disparar evento de alteração nas relações de empresa
        eventService.dispatch(EVENTS.COMPANY_RELATION_CHANGED, {});
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to create company'));
      toast.error("Erro ao criar empresa");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setError]);

  const { updateCompany } = useCompanyUpdate({ 
    setIsLoading, 
    setCompanies,
    selectedCompany: null,
    setSelectedCompany
  });

  const { deleteCompany } = useCompanyDelete({
    setIsLoading,
    setCompanies,
    selectedCompany: null,
    setSelectedCompany
  });

  const { 
    assignUserToCompany, 
    removeUserFromCompany 
  } = useCompanyUserRelationship({
    setIsLoading,
    setError
  });

  return {
    fetchCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  };
};
