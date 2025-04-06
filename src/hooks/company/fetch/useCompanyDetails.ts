
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useCompanyDetails = ({
  setIsLoading
}: Pick<UseCompanyFetchProps, 'setIsLoading'>) => {
  /**
   * Gets a specific company by ID
   */
  const getCompanyById = async (companyId: string): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').eq('id', companyId).single()
      );

      if (error) {
        console.error("Error fetching company:", error);
        toast("Erro ao buscar empresa", {
          description: error.message,
        });
        return null;
      }

      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar a empresa",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getCompanyById };
};
