
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company, UserCompanyRelation } from "@/types/company";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Erro ao buscar empresas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCompany = useCallback(async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('empresas')
        .insert(companyData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setCompanies(prev => [...prev, data]);
      
      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: 'Erro ao criar empresa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCompany = useCallback(async (id: string, companyData: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('empresas')
        .update({ ...companyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? data : company
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: 'Erro ao atualizar empresa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCompany = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setCompanies(prev => prev.filter(company => company.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Empresa removida com sucesso',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Erro ao remover empresa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          company_id: companyId
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Usuário associado à empresa com sucesso',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error assigning user to company:', error);
      toast({
        title: 'Erro ao associar usuário à empresa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Usuário removido da empresa com sucesso',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing user from company:', error);
      toast({
        title: 'Erro ao remover usuário da empresa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUserCompanies = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      if (!data.length) {
        return [];
      }
      
      const companyIds = data.map(relation => relation.company_id);
      
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds);
        
      if (companiesError) {
        throw companiesError;
      }
      
      return companies || [];
    } catch (error: any) {
      console.error('Error fetching user companies:', error);
      toast({
        title: 'Erro ao buscar empresas do usuário',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { 
    companies, 
    loading, 
    fetchCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany,
    fetchUserCompanies
  };
}
