
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from '@/types/company';
import { toast } from "sonner";

interface UseCompanyUpdateProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyUpdate = ({ 
  setIsLoading, 
  setCompanies, 
  selectedCompany, 
  setSelectedCompany 
}: UseCompanyUpdateProps) => {
  
  const updateCompany = useCallback(async (companyId: string, data: Partial<Company>) => {
    setIsLoading(true);
    try {
      const { data: updatedCompany, error } = await supabase
        .from('empresas')
        .update(data)
        .eq('id', companyId)
        .select()
        .single();
  
      if (error) throw error;
  
      if (updatedCompany) {
        // Update companies list
        setCompanies(prevCompanies => prevCompanies.map(company => 
          company.id === companyId ? { ...company, ...updatedCompany } : company
        ));
        
        // Update selected company if it's the one being updated
        if (selectedCompany?.id === companyId) {
          const newSelectedCompany = { ...selectedCompany, ...updatedCompany };
          setSelectedCompany(newSelectedCompany);
          localStorage.setItem('selectedCompany', JSON.stringify(newSelectedCompany));
          
          // Atualizar cache do nome da empresa para sincronizar com outros componentes
          if (newSelectedCompany.nome) {
            localStorage.setItem('selectedCompanyName', newSelectedCompany.nome);
          }
        }
        
        // Dispatch event so other components can update - use custom event with company data
        const event = new CustomEvent('company-updated', { 
          detail: { company: updatedCompany } 
        });
        window.dispatchEvent(event);
        
        // Dispatch additional event specifically for company name changes to force cache refresh
        if (data.nome) {
          const nameChangeEvent = new CustomEvent('company-name-changed', {
            detail: { companyId, newName: data.nome, company: updatedCompany }
          });
          window.dispatchEvent(nameChangeEvent);
        }
        
        toast.success(`Empresa ${updatedCompany.nome} atualizada com sucesso!`);
      }
      
      return updatedCompany as Company;
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error("Erro ao atualizar empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany]);
  
  return { updateCompany };
};
