
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from '@/types/company';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface UseCompanyDeleteProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyDelete = ({ 
  setIsLoading, 
  setCompanies, 
  selectedCompany, 
  setSelectedCompany 
}: UseCompanyDeleteProps) => {
  const { userProfile } = useAuth();
  
  const deleteCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    try {
      // First check if the user has permission to delete this company
      if (!userProfile?.super_admin) {
        // Regular admins can only delete companies they created
        const { data: companyCreator, error: creatorError } = await supabase
          .from('empresas')
          .select('created_by')
          .eq('id', companyId)
          .single();
          
        if (creatorError) {
          console.error('Error checking company creator:', creatorError);
          toast.error("Erro ao verificar permissões");
          setIsLoading(false);
          return;
        }
        
        if (companyCreator.created_by !== userProfile?.id) {
          toast.error("Você não tem permissão para excluir esta empresa");
          setIsLoading(false);
          return;
        }
      }
      
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);
  
      if (error) throw error;
  
      // Remove from companies list
      setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== companyId));
      
      // Clear selected company if it's the one being deleted
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
      }
      
      toast.success("Empresa excluída com sucesso!");
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error("Erro ao excluir empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany, userProfile]);
  
  const canDeleteCompany = useCallback(async (companyId: string): Promise<boolean> => {
    if (userProfile?.super_admin) {
      return true; // Super admins can delete any company
    }
    
    try {
      // Check if this company was created by the current user
      const { data, error } = await supabase
        .from('empresas')
        .select('created_by')
        .eq('id', companyId)
        .single();
        
      if (error) {
        console.error('Error checking company creator:', error);
        return false;
      }
      
      return data.created_by === userProfile?.id;
    } catch (error) {
      console.error('Error checking delete permissions:', error);
      return false;
    }
  }, [userProfile]);
  
  return { deleteCompany, canDeleteCompany };
};
