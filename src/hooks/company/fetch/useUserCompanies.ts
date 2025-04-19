
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

// Cache expiration time in ms (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany,
  setError
}: UseCompanyFetchProps) => {
  /**
   * Check if the companies cache is valid
   */
  const isCacheValid = (): boolean => {
    const cachedData = localStorage.getItem('userCompaniesTimestamp');
    if (!cachedData) return false;
    
    try {
      const timestamp = parseInt(cachedData, 10);
      const now = Date.now();
      return (now - timestamp) < CACHE_EXPIRATION;
    } catch (e) {
      return false;
    }
  };

  /**
   * Gets all companies a user is related to
   */
  const getUserCompanies = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    // First check if we already have cached data
    const cachedCompanies = localStorage.getItem('userCompanies');
    let cachedData: Company[] = [];
    
    if (cachedCompanies) {
      try {
        cachedData = JSON.parse(cachedCompanies) as Company[];
        
        if (setUserCompanies) {
          setUserCompanies(cachedData);
        }
        
        if (cachedData.length === 1 && setSelectedCompany) {
          setSelectedCompany(cachedData[0]);
        }
        
        if (isCacheValid() && cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
      } catch (e) {
        console.error("Error parsing cached companies", e);
      }
    }

    setIsLoading(true);

    try {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      
      const { data: relations, error: relationsError } = await retryOperation(
        async () => {
          const req = supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', userId);
            
          if (signal) {
            req.abortSignal(signal);
          }
          
          return await req;
        }
      );

      if (relationsError) throw relationsError;

      if (!relations || relations.length === 0) {
        setUserCompanies([]);
        setSelectedCompany(null);
        localStorage.removeItem('userCompanies');
        return [];
      }

      const companyIds = relations.map(r => r.empresa_id);
      
      const { data: companies, error: companiesError } = await retryOperation(
        async () => {
          const req = supabase
            .from('empresas')
            .select('*')
            .in('id', companyIds)
            .order('nome');
            
          if (signal) {
            req.abortSignal(signal);
          }
          
          return await req;
        }
      );

      if (companiesError) throw companiesError;

      const userCompaniesData = companies as Company[];
      setUserCompanies(userCompaniesData);
      
      if (userCompaniesData.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(userCompaniesData));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
      }
      
      if (userCompaniesData.length === 1) {
        setSelectedCompany(userCompaniesData[0]);
      }
      
      return userCompaniesData;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        return cachedData;
      }
      
      console.error("Error fetching user companies:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch user companies"));
      
      if (cachedData.length > 0) {
        return cachedData;
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserCompanies };
};
