
import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyUpdate } from "./useCompanyUpdate";
import { useCompanyDelete } from "./useCompanyDelete";

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
    
    const event = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(event);
  }, [setSelectedCompany]);

  const createCompany = useCallback(async (data: Partial<Company>) => {
    setIsLoading(true);
    try {
      const { data: newCompany, error } = await supabase
        .from('empresas')
        .insert([data])
        .select()
        .single();
  
      if (error) throw error;
  
      if (newCompany) {
        setCompanies(prevCompanies => [...prevCompanies, newCompany as Company]);
        toast.success(`Empresa ${newCompany.nome} criada com sucesso!`);
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

  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_empresa')
        .insert([{ user_id: userId, empresa_id: companyId }]);
  
      if (error) throw error;
      
      window.dispatchEvent(new Event('company-relation-changed'));
      toast.success("Usuário associado à empresa com sucesso!");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to assign user to company'));
      toast.error("Erro ao associar usuário à empresa");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);

  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
  
      if (error) throw error;
      
      window.dispatchEvent(new Event('company-relation-changed'));
      toast.success("Usuário removido da empresa com sucesso!");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to remove user from company'));
      toast.error("Erro ao remover usuário da empresa");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);

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
