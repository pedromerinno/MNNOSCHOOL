import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCompanyModificationProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[]) => void;
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
  
      if (error) {
        console.error("Error creating company:", error);
        toast.error("Erro ao criar empresa", {
          description: error.message,
        });
        throw error;
      }
  
      if (newCompany) {
        setCompanies(prevCompanies => [...prevCompanies, newCompany]);
        toast.success(`Empresa ${newCompany.nome} criada com sucesso!`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao criar a empresa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies]);

  const updateCompany = useCallback(async (id: string, data: Partial<Company>) => {
    setIsLoading(true);
    try {
      const { data: updatedCompany, error } = await supabase
        .from('empresas')
        .update(data)
        .eq('id', id)
        .select()
        .single();
  
      if (error) {
        console.error("Error updating company:", error);
        toast.error("Erro ao atualizar empresa", {
          description: error.message,
        });
        throw error;
      }
  
      if (updatedCompany) {
        setCompanies(prevCompanies =>
          prevCompanies.map(company => (company.id === id ? updatedCompany : company))
        );
        setSelectedCompany(updatedCompany);
        
        // Dispatch event to notify other components about this update
        const updateEvent = new CustomEvent('company-updated', { 
          detail: { company: updatedCompany } 
        });
        window.dispatchEvent(updateEvent);
        
        toast.success(`Empresa ${updatedCompany.nome} atualizada com sucesso!`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao atualizar a empresa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setSelectedCompany]);

  const deleteCompany = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
  
      if (error) {
        console.error("Error deleting company:", error);
        toast.error("Erro ao excluir empresa", {
          description: error.message,
        });
        throw error;
      }
  
      setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== id));
      setSelectedCompany(null);
      localStorage.removeItem('selectedCompanyId');
      
      // Dispatch event to notify other components about this deletion
      const deleteEvent = new CustomEvent('company-deleted', { detail: { companyId: id } });
      window.dispatchEvent(deleteEvent);
      
      toast.success("Empresa excluída com sucesso!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao excluir a empresa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setSelectedCompany]);

  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .insert([{ user_id: userId, empresa_id: companyId }]);
  
      if (error) {
        console.error("Error assigning user to company:", error);
        toast.error("Erro ao associar usuário à empresa", {
          description: error.message,
        });
        throw error;
      }
      
      // Dispatch a custom event to notify components about the change
      const event = new CustomEvent('company-relation-changed');
      window.dispatchEvent(event);
      
      toast.success("Usuário associado à empresa com sucesso!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao associar o usuário à empresa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
  
      if (error) {
        console.error("Error removing user from company:", error);
        toast.error("Erro ao remover usuário da empresa", {
          description: error.message,
        });
        throw error;
      }
      
      // Dispatch a custom event to notify components about the change
      const event = new CustomEvent('company-relation-changed');
      window.dispatchEvent(event);
      
      toast.success("Usuário removido da empresa com sucesso!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao remover o usuário da empresa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

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
