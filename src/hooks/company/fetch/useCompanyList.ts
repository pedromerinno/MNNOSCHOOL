import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation, isNetworkError, isServerError } from "../utils/retryUtils";
import { cacheData, getCachedData } from "../utils/cacheUtils";
import { UseCompanyFetchProps, FetchError, RetryOptions } from "../types/fetchTypes";

export const useCompanyList = ({
  setIsLoading,
  setCompanies
}: Pick<UseCompanyFetchProps, 'setIsLoading' | 'setCompanies'>) => {
  
  const CACHE_KEY = 'allCompanies';
  
  /**
   * Retrieves companies from cache if available
   */
  const getCompaniesFromCache = (): Company[] | null => {
    return getCachedData<Company[]>(CACHE_KEY);
  };
  
  /**
   * Fetches all companies from the database with enhanced error handling
   */
  const fetchCompanies = async (options?: Partial<RetryOptions>): Promise<void> => {
    setIsLoading(true);
    
    // First try to use cached data to provide immediate feedback
    const cachedCompanies = getCompaniesFromCache();
    if (cachedCompanies) {
      console.log("Using cached companies while fetching updates");
      setCompanies(cachedCompanies);
    }
    
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').order('nome'),
        {
          ...options,
          shouldRetry: (err) => isNetworkError(err) || isServerError(err)
        }
      );

      if (error) {
        console.error("Error fetching companies:", error);
        toast.error("Erro ao buscar empresas", {
          description: error.message,
        });
        return;
      }

      const companiesData = data as Company[];
      setCompanies(companiesData);
      
      // Cache the successful response
      if (companiesData && companiesData.length > 0) {
        cacheData(companiesData, { cacheKey: CACHE_KEY });
      }
      
    } catch (error) {
      const fetchError = error as FetchError;
      console.error("Unexpected error in fetchCompanies:", fetchError);
      
      toast.error("Erro ao buscar empresas", {
        description: fetchError.message || "Ocorreu um erro ao buscar as empresas",
      });
      
      // If we have cached data but fetch failed, keep using the cached data
      if (cachedCompanies && cachedCompanies.length > 0) {
        console.log("Using cached companies after fetch failure");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    fetchCompanies,
    getCompaniesFromCache
  };
};
