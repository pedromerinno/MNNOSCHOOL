
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useCompanyList = ({
  setIsLoading,
  setCompanies
}: Pick<UseCompanyFetchProps, 'setIsLoading' | 'setCompanies'>) => {
  /**
   * Fetches all companies from the database
   */
  const fetchCompanies = async (): Promise<void> => {
    // If already loading, don't start new request
    if (setIsLoading) {
      setIsLoading(true);
    }
    
    try {
      // Add a small delay before fetching to avoid rapid consecutive requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data, error } = await retryOperation(
        async () => {
          console.log('[Company List] Fetching companies from Supabase');
          // Limit the columns we select to reduce data transfer
          return await supabase
            .from('empresas')
            .select('id, nome, logo, cor_principal, frase_institucional')
            .order('nome');
        }
      );

      if (error) {
        console.error("[Company List] Error fetching companies:", error);
        toast("Erro ao buscar empresas", {
          description: error.message,
        });
        return;
      }

      if (data) {
        console.log(`[Company List] Fetched ${data.length} companies successfully`);
        if (setCompanies) {
          setCompanies(data as Company[]);
        }
      }
    } catch (error: any) {
      console.error("[Company List] Unexpected error:", error);
      
      // Show a more helpful message about connection issues
      toast("Erro ao conectar", {
        description: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      });
    } finally {
      if (setIsLoading) {
        setIsLoading(false);
      }
    }
  };

  return { fetchCompanies };
};
