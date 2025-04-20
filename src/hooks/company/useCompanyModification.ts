
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseCompanyModificationProps {
  companies: Company[];
  userCompanies: Company[];
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useCompanyModification = ({
  companies,
  userCompanies,
  setCompanies,
  setSelectedCompany,
  setIsLoading,
  setError
}: UseCompanyModificationProps) => {
  // Fetch all companies
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setCompanies(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch companies'));
      toast.error('Erro ao buscar empresas');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies, setIsLoading, setError]);
  
  // Create a new company
  const createCompany = useCallback(async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert(companyData)
        .select()
        .single();
        
      if (error) throw error;
      
      setCompanies([...companies, data]);
      toast.success('Empresa criada com sucesso!');
      
      // Trigger an event to notify other components
      window.dispatchEvent(new Event('company-created'));
      
      return data;
    } catch (err) {
      console.error('Error creating company:', err);
      setError(err instanceof Error ? err : new Error('Failed to create company'));
      toast.error('Erro ao criar empresa');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companies, setCompanies, setIsLoading, setError]);
  
  // Update an existing company
  const updateCompany = useCallback(async (
    companyId: string, 
    companyData: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(companyData)
        .eq('id', companyId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedCompanies = companies.map(company => 
        company.id === companyId ? data : company
      );
      
      setCompanies(updatedCompanies);
      
      // Update selected company if it was the one updated
      const companyEvent = new CustomEvent('company-updated', {
        detail: { company: data }
      });
      window.dispatchEvent(companyEvent);
      
      toast.success('Empresa atualizada com sucesso!');
      return data;
    } catch (err) {
      console.error('Error updating company:', err);
      setError(err instanceof Error ? err : new Error('Failed to update company'));
      toast.error('Erro ao atualizar empresa');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companies, setCompanies, setIsLoading, setError]);
  
  // Delete a company
  const deleteCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);
        
      if (error) throw error;
      
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      setCompanies(updatedCompanies);
      
      // Trigger an event to notify other components
      window.dispatchEvent(new Event('company-deleted'));
      
      toast.success('Empresa excluída com sucesso!');
    } catch (err) {
      console.error('Error deleting company:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete company'));
      toast.error('Erro ao excluir empresa');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companies, setCompanies, setIsLoading, setError]);
  
  // Select a company
  const selectCompany = useCallback((userId: string, company: Company) => {
    // Save the selected company to localStorage for persistence
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    localStorage.setItem('selectedCompanyId', company.id);
    
    // Update the state with the selected company
    setSelectedCompany(company);
    
    // Trigger an event to notify other components
    const event = new CustomEvent('company-selected', { 
      detail: { company } 
    });
    window.dispatchEvent(event);
    
    return company;
  }, [setSelectedCompany]);
  
  return {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    selectCompany
  };
};
