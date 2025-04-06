import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company, UserCompanyRelation, UserCompanyDetails } from "@/types/company";

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
      
      const typedCompanies: Company[] = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        logo: item.logo,
        frase_institucional: item.frase_institucional,
        missao: item.missao,
        historia: item.historia,
        valores: item.valores,
        video_institucional: item.video_institucional,
        descricao_video: item.descricao_video,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setCompanies(typedCompanies);
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
      
      const newCompany: Company = {
        id: data.id,
        nome: data.nome,
        logo: data.logo,
        frase_institucional: data.frase_institucional,
        missao: data.missao,
        historia: data.historia,
        valores: data.valores,
        video_institucional: data.video_institucional,
        descricao_video: data.descricao_video,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCompanies(prev => [...prev, newCompany]);
      
      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso',
      });
      
      return newCompany;
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
      
      const updatedCompany: Company = {
        id: data.id,
        nome: data.nome,
        logo: data.logo,
        frase_institucional: data.frase_institucional,
        missao: data.missao,
        historia: data.historia,
        valores: data.valores,
        video_institucional: data.video_institucional,
        descricao_video: data.descricao_video,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? updatedCompany : company
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso',
      });
      
      return updatedCompany;
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
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds);
        
      if (companiesError) {
        throw companiesError;
      }
      
      const typedCompanies: Company[] = companiesData?.map(item => ({
        id: item.id,
        nome: item.nome,
        logo: item.logo,
        frase_institucional: item.frase_institucional,
        missao: item.missao,
        historia: item.historia,
        valores: item.valores,
        video_institucional: item.video_institucional,
        descricao_video: item.descricao_video,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      return typedCompanies;
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

  const getUserCompany = useCallback(async (userId: string): Promise<UserCompanyDetails> => {
    try {
      const result: UserCompanyDetails = {
        company: null,
        loading: true,
        error: null
      };
      
      const { data: relationData, error: relationError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (relationError) {
        throw relationError;
      }
      
      if (relationData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', relationData.company_id)
          .maybeSingle();
          
        if (companyError) {
          throw companyError;
        }
        
        if (companyData) {
          result.company = {
            id: companyData.id,
            nome: companyData.nome,
            logo: companyData.logo,
            frase_institucional: companyData.frase_institucional,
            missao: companyData.missao,
            historia: companyData.historia,
            valores: companyData.valores,
            video_institucional: companyData.video_institucional,
            descricao_video: companyData.descricao_video,
            created_at: companyData.created_at,
            updated_at: companyData.updated_at
          };
        }
      }
      
      return { ...result, loading: false };
    } catch (error: any) {
      console.error('Error fetching user company:', error);
      return {
        company: null,
        loading: false,
        error: error
      };
    }
  }, []);

  return { 
    companies, 
    loading, 
    fetchCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany,
    fetchUserCompanies,
    getUserCompany
  };
}
