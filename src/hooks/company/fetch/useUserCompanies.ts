
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation, isNetworkError, isServerError } from "../utils/retryUtils";
import { cacheData, getCachedData } from "../utils/cacheUtils";
import { UseCompanyFetchProps, FetchError, RetryOptions } from "../types/fetchTypes";

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany
}: Pick<UseCompanyFetchProps, 'setIsLoading' | 'setUserCompanies' | 'setSelectedCompany'>) => {
  
  const getCacheKey = (userId: string) => `userCompanies_${userId}`;
  
  /**
   * Retrieves user companies from cache if available
   */
  const getUserCompaniesFromCache = (userId: string): Company[] | null => {
    return getCachedData<Company[]>(getCacheKey(userId));
  };
  
  /**
   * Fetches all companies a user is related to with enhanced error handling
   */
  const getUserCompanies = async (userId: string, options?: Partial<RetryOptions>): Promise<Company[]> => {
    setIsLoading(true);
    
    // First check if we already have data in cache
    const cachedCompanies = getUserCompaniesFromCache(userId);
    let cachedData: Company[] = [];
    
    if (cachedCompanies && cachedCompanies.length > 0) {
      cachedData = cachedCompanies;
      // Update state with cached data immediately
      setUserCompanies(cachedData);
      console.log("Using cached user companies while fetching updates");
      
      // If we have only one company in cache, select it automatically
      if (cachedData.length === 1) {
        setSelectedCompany(cachedData[0]);
      }
    }

    try {
      // Get all company IDs the user is related to with retry logic
      const { data: userCompanyRelations, error: relationsError } = await retryOperation(
        async () => await supabase.from('user_empresa').select('company_id').eq('user_id', userId),
        {
          ...options,
          shouldRetry: (err) => isNetworkError(err) || isServerError(err)
        }
      );

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        toast.error("Erro ao buscar empresas do usuário", {
          description: relationsError.message,
        });
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        console.log("No company relations found for user", userId);
        setUserCompanies([]);
        setSelectedCompany(null);
        localStorage.removeItem(getCacheKey(userId));
        setIsLoading(false);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await retryOperation(
        async () => await supabase.from('empresas').select('*').in('id', companyIds).order('nome'),
        {
          ...options,
          shouldRetry: (err) => isNetworkError(err) || isServerError(err)
        }
      );

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        toast.error("Erro ao buscar detalhes das empresas", {
          description: companiesError.message,
        });
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        return [];
      }

      const userCompaniesData = companies as Company[];
      setUserCompanies(userCompaniesData);
      
      // Cache the companies for offline fallback
      if (userCompaniesData.length > 0) {
        cacheData(userCompaniesData, { cacheKey: getCacheKey(userId), expirationMs: 24 * 60 * 60 * 1000 }); // 24 hour cache
      }
      
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
      const fetchError = error as FetchError;
      console.error("Unexpected error in getUserCompanies:", fetchError);
      
      toast.error("Erro ao buscar empresas do usuário", {
        description: fetchError.message || "Ocorreu um erro ao buscar as empresas",
      });
      
      // Return cached data in case of error
      if (cachedData.length > 0) {
        console.log("Using cached user companies due to error");
        return cachedData;
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    getUserCompanies,
    getUserCompaniesFromCache
  };
};
