
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { toast } from 'sonner';
import { UseCompanyCreateProps } from './types/createTypes';

export const useCompanyCreate = ({ 
  setIsLoading, 
  setCompanies 
}: UseCompanyCreateProps) => {
  /**
   * Create a new company and add it to the companies list
   */
  const createCompany = async (companyData: Partial<Company>): Promise<Company | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([companyData])
        .select()
        .single();
        
      if (error) throw error;
      
      const newCompany = data as Company;
      
      // Update local state with the new company
      setCompanies(prev => [...prev, newCompany]);
      
      // Notify success
      toast.success("Empresa criada com sucesso", {
        description: `${newCompany.nome} foi adicionada ao sistema.`,
      });
      
      // Trigger event so other components can update
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return newCompany;
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error("Erro ao criar empresa", {
        description: error.message || "Houve um problema ao criar a empresa",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Fetch all companies from the database
   */
  const fetchCompanies = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setCompanies(data as Company[]);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast.error("Erro ao buscar empresas", {
        description: error.message || "Houve um problema ao buscar as empresas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { createCompany, fetchCompanies };
};
