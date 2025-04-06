
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  /**
   * Fetches all companies from the database
   */
  const fetchCompanies = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) {
        console.error("Error fetching companies:", error);
        toast({
          title: "Erro ao buscar empresas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCompanies(data as Company[]);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar as empresas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all companies a user is related to and automatically selects
   * the first one if there's only one company
   */
  const getUserCompanies = async (userId: string): Promise<Company[]> => {
    setIsLoading(true);
    try {
      // Get all company IDs the user is related to
      const { data: userCompanyRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        toast({
          title: "Erro ao buscar empresas",
          description: relationsError.message,
          variant: "destructive",
        });
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        setUserCompanies([]);
        setSelectedCompany(null);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds)
        .order('nome');

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        toast({
          title: "Erro ao buscar detalhes das empresas",
          description: companiesError.message,
          variant: "destructive",
        });
        return [];
      }

      const userCompaniesData = companies as Company[];
      setUserCompanies(userCompaniesData);
      
      // If there's only one company, automatically select it
      if (userCompaniesData.length === 1) {
        setSelectedCompany(userCompaniesData[0]);
        
        // Dispatch event to notify other components about this selection
        const navEvent = new CustomEvent('company-selected', { 
          detail: { userId, company: userCompaniesData[0] } 
        });
        window.dispatchEvent(navEvent);
      }
      
      return userCompaniesData;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar as empresas",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets a specific company by ID
   */
  const getCompanyById = async (companyId: string): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error("Error fetching company:", error);
        toast({
          title: "Erro ao buscar empresa",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar a empresa",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Selects a company for the current user session (UI only, no database changes)
   */
  const selectCompany = (userId: string, company: Company) => {
    setSelectedCompany(company);
    
    // Dispatch event to notify other components
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
    
    console.log('Company selected:', company.nome);
  };

  /**
   * Creates a new company in the database
   */
  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([companyData])
        .select('*')
        .single();

      if (error) {
        console.error("Error creating company:", error);
        toast({
          title: "Erro ao criar empresa",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Update the local state
      setCompanies(prev => [...prev, data as Company]);
      
      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso",
      });
      
      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a empresa",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing company
   */
  const updateCompany = async (companyId: string, companyData: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(companyData)
        .eq('id', companyId)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating company:", error);
        toast({
          title: "Erro ao atualizar empresa",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Update the local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? { ...company, ...data } as Company : company
      ));
      
      // If the selected company was updated, update it as well
      if (selectedCompany && selectedCompany.id === companyId) {
        const updatedCompany = { ...selectedCompany, ...data } as Company;
        setSelectedCompany(updatedCompany);
      }
      
      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso",
      });
      
      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar a empresa",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a company by ID
   */
  const deleteCompany = async (companyId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);

      if (error) {
        console.error("Error deleting company:", error);
        toast({
          title: "Erro ao excluir empresa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Update the local state
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      
      // If the selected company was deleted, clear it
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(null);
      }
      
      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir a empresa",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Assigns a user to a company
   */
  const assignUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_empresa')
        .insert([{ user_id: userId, company_id: companyId }]);

      if (error) {
        console.error("Error assigning user to company:", error);
        toast({
          title: "Erro ao adicionar usuário à empresa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Usuário adicionado",
        description: "O usuário foi adicionado à empresa com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar o usuário à empresa",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Removes a user from a company
   */
  const removeUserFromCompany = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) {
        console.error("Error removing user from company:", error);
        toast({
          title: "Erro ao remover usuário da empresa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Usuário removido",
        description: "O usuário foi removido da empresa com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao remover o usuário da empresa",
        variant: "destructive",
      });
      return false;
    }
  };

  // Listener para seleção de empresas
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company) {
        setSelectedCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, []);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    fetchCompanies,
    getUserCompanies,
    getCompanyById,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  };
};
