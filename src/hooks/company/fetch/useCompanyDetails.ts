
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation, isNetworkError, isServerError } from "../utils/retryUtils";
import { cacheData, getCachedData } from "../utils/cacheUtils";
import { UseCompanyFetchProps, FetchError, RetryOptions } from "../types/fetchTypes";

export const useCompanyDetails = ({
  setIsLoading
}: Pick<UseCompanyFetchProps, 'setIsLoading'>) => {
  
  const getCacheKey = (companyId: string) => `company_${companyId}`;
  
  /**
   * Retrieves company from cache if available
   */
  const getCompanyFromCache = (companyId: string): Company | null => {
    return getCachedData<Company>(getCacheKey(companyId));
  };
  
  /**
   * Gets a specific company by ID with enhanced error handling
   */
  const getCompanyById = async (companyId: string, options?: Partial<RetryOptions>): Promise<Company | null> => {
    setIsLoading(true);
    
    // First try to use cached data to provide immediate feedback
    const cachedCompany = getCompanyFromCache(companyId);
    if (cachedCompany) {
      console.log(`Using cached company ${companyId} while fetching updates`);
    }
    
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').eq('id', companyId).single(),
        {
          ...options,
          shouldRetry: (err) => isNetworkError(err) || isServerError(err)
        }
      );

      if (error) {
        console.error("Error fetching company:", error);
        toast.error("Erro ao buscar empresa", {
          description: error.message,
        });
        
        // Return cached data if available
        return cachedCompany;
      }

      const companyData = data as Company;
      
      // Cache the successful response
      if (companyData) {
        cacheData(companyData, { cacheKey: getCacheKey(companyId) });
      }
      
      return companyData;
    } catch (error) {
      const fetchError = error as FetchError;
      console.error("Unexpected error in getCompanyById:", fetchError);
      
      toast.error("Erro ao buscar empresa", {
        description: fetchError.message || "Ocorreu um erro ao buscar a empresa",
      });
      
      // If we have cached data but fetch failed, return the cached data
      return cachedCompany;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    getCompanyById,
    getCompanyFromCache
  };
};
