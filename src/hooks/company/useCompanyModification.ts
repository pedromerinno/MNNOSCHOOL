
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { retryOperation } from './utils/retryUtils';

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
  // Improved fetch companies with retry and better error handling
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
          
        if (error) throw error;
        
        return data || [];
      };
      
      // Use retry operation for network resilience
      const data = await retryOperation(fetchData, 4, 1000);
      
      setCompanies(data);
      return data;
    } catch (err) {
      console.error('Error fetching companies:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch companies';
        
      const isNetworkError = 
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection');
        
      setError(new Error(
        isNetworkError 
          ? 'Erro de conexão ao buscar empresas. Verifique sua conexão com a internet.' 
          : 'Erro ao buscar empresas'
      ));
      
      toast.error('Erro ao buscar empresas', {
        description: isNetworkError 
          ? 'Problemas de conexão detectados. Tente novamente mais tarde.' 
          : 'Ocorreu um erro ao carregar as empresas',
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies, setIsLoading, setError]);
  
  // Create a new company with improved error handling
  const createCompany = useCallback(async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const createData = async () => {
        const { data, error } = await supabase
          .from('empresas')
          .insert(companyData)
          .select()
          .single();
            
        if (error) throw error;
        return data;
      };
      
      // Use retry operation for network resilience
      const data = await retryOperation(createData, 3, 1000);
      
      setCompanies([...companies, data]);
      toast.success('Empresa criada com sucesso!');
      
      // Trigger an event to notify other components
      window.dispatchEvent(new Event('company-created'));
      
      return data;
    } catch (err) {
      console.error('Error creating company:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      
      setError(new Error(
        isNetworkError 
          ? 'Erro de conexão ao criar empresa. Verifique sua conexão com a internet.' 
          : 'Erro ao criar empresa'
      ));
      
      toast.error('Erro ao criar empresa', {
        description: isNetworkError 
          ? 'Problemas de conexão detectados. Verifique sua internet e tente novamente.' 
          : 'Ocorreu um erro ao criar a empresa',
      });
      
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
      const updateData = async () => {
        const { data, error } = await supabase
          .from('empresas')
          .update(companyData)
          .eq('id', companyId)
          .select()
          .single();
            
        if (error) throw error;
        return data;
      };
      
      // Use retry operation for network resilience
      const data = await retryOperation(updateData, 3, 1000);
      
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
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      
      setError(new Error(
        isNetworkError 
          ? 'Erro de conexão ao atualizar empresa. Verifique sua conexão com a internet.' 
          : 'Erro ao atualizar empresa'
      ));
      
      toast.error('Erro ao atualizar empresa', {
        description: isNetworkError 
          ? 'Problemas de conexão detectados. Verifique sua internet e tente novamente.' 
          : 'Ocorreu um erro ao atualizar a empresa',
      });
      
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
      const deleteData = async () => {
        const { error } = await supabase
          .from('empresas')
          .delete()
          .eq('id', companyId);
            
        if (error) throw error;
        return true;
      };
      
      // Use retry operation for network resilience
      await retryOperation(deleteData, 3, 1000);
      
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      setCompanies(updatedCompanies);
      
      // Trigger an event to notify other components
      window.dispatchEvent(new Event('company-deleted'));
      
      toast.success('Empresa excluída com sucesso!');
    } catch (err) {
      console.error('Error deleting company:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      
      setError(new Error(
        isNetworkError 
          ? 'Erro de conexão ao excluir empresa. Verifique sua conexão com a internet.' 
          : 'Erro ao excluir empresa'
      ));
      
      toast.error('Erro ao excluir empresa', {
        description: isNetworkError 
          ? 'Problemas de conexão detectados. Verifique sua internet e tente novamente.' 
          : 'Ocorreu um erro ao excluir a empresa',
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companies, setCompanies, setIsLoading, setError]);
  
  // Select a company
  const selectCompany = useCallback((userId: string, company: Company) => {
    try {
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
    } catch (err) {
      console.error('Error selecting company:', err);
      toast.error('Erro ao selecionar empresa', {
        description: 'Não foi possível selecionar a empresa. Tente novamente.'
      });
      return company;
    }
  }, [setSelectedCompany]);
  
  return {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    selectCompany
  };
};
