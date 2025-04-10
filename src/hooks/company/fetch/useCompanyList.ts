
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
    // Se já estivermos carregando, não iniciar nova requisição
    if (setIsLoading) {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').order('nome')
      );

      if (error) {
        console.error("Error fetching companies:", error);
        toast("Erro ao buscar empresas", {
          description: error.message,
        });
        return;
      }

      if (data) {
        console.log(`Fetched ${data.length} companies successfully`);
        if (setCompanies) {
          setCompanies(data as Company[]);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas",
      });
    } finally {
      if (setIsLoading) {
        setIsLoading(false);
      }
    }
  };

  return { fetchCompanies };
};
