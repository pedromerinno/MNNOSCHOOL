import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company, UserCompanyDetails } from "@/types/company";
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

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

      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso",
      });

      // Refresh the companies list
      await fetchCompanies();
      
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
   * Updates an existing company in the database
   */
  const updateCompany = async (
    companyId: string, 
    companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({
          ...companyData,
          updated_at: new Date().toISOString()
        })
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

      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso",
      });

      // Refresh the companies list
      await fetchCompanies();
      
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
   * Deletes a company from the database
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

      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso",
      });

      // Refresh the companies list
      await fetchCompanies();
      
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
   * Fetches all companies a user is related to
   * Only reads data, doesn't modify relationships
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
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds);

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        toast({
          title: "Erro ao buscar detalhes das empresas",
          description: companiesError.message,
          variant: "destructive",
        });
        return [];
      }

      return companies as Company[];
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
   * Assigns a user to a company
   */
  const assignUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if the user is already assigned to this company
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (checkError) {
        console.error("Error checking user company relation:", checkError);
        toast({
          title: "Erro ao verificar relação",
          description: checkError.message,
          variant: "destructive",
        });
        return false;
      }

      // If the relation already exists, don't create a duplicate
      if (existingRelation && existingRelation.length > 0) {
        toast({
          title: "Usuário já associado",
          description: "Este usuário já está associado a esta empresa.",
          variant: "destructive",
        });
        return false;
      }

      // Create the relation
      const { error: insertError } = await supabase
        .from('user_empresa')
        .insert([
          { user_id: userId, company_id: companyId }
        ]);

      if (insertError) {
        console.error("Error assigning user to company:", insertError);
        toast({
          title: "Erro ao associar usuário",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Usuário associado",
        description: "Usuário associado à empresa com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao associar o usuário à empresa",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Removes a user from a company
   */
  const removeUserFromCompany = async (userId: string, companyId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) {
        console.error("Error removing user from company:", error);
        toast({
          title: "Erro ao remover usuário",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Usuário removido",
        description: "Usuário removido da empresa com sucesso",
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    companies,
    fetchCompanies,
    getUserCompanies,
    getCompanyById,
    // Include only the admin functions for database changes
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  };
};
