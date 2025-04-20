import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";
import { checkIfUserIsAdmin, checkIfUserIsSuperAdmin } from "@/utils/adminUtils";

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

      const isAdmin = await checkIfUserIsAdmin(userId);
      const isSuperAdmin = await checkIfUserIsSuperAdmin(userId);
      
      let companies: Company[] = [];
      
      if (isAdmin || isSuperAdmin) {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
          
        if (error) {
          throw error;
        }
        
        companies = data as Company[];
      } else {
        const { data, error } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No companies found for user:", userId);
          setUserCompanies([]);
          setSelectedCompany(null);
          localStorage.removeItem('userCompanies');
          setIsLoading(false);
          return [];
        }

        const companyIds = data.map(r => r.empresa_id);
        console.log(`Found ${companyIds.length} company relations`);

        const { data: companiesData, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .in('id', companyIds)
          .order('nome');

        if (companiesError) {
          throw companiesError;
        }

        companies = companiesData as Company[];
      }

      if (companies.length > 0) {
        setUserCompanies(companies);
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());

        if (companies.length === 1) {
          setSelectedCompany(companies[0]);
        }
      }

      setIsLoading(false);
      return companies;
    } catch (error) {
      console.error("Error in getUserCompanies:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch companies"));
      
      // Try to load from cache as last resort
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const cachedCompanies = JSON.parse(cachedData) as Company[];
          if (cachedCompanies && cachedCompanies.length > 0) {
            console.log("Using cached companies after error");
            setUserCompanies(cachedCompanies);
            return cachedCompanies;
          }
        } catch (e) {
          console.error("Error parsing cached companies", e);
        }
      }
      
      return [];
    }
  };

  return { getUserCompanies };
};
