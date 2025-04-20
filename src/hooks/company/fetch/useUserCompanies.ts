
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

      // Use alternative approaches to avoid the recursive RLS issue
      let companies: Company[] = [];
      let fetchingMethod = 'direct';
      
      try {
        // Try using the RPC function approach first
        const isAdmin = await checkIfUserIsAdmin(userId);
        const isSuperAdmin = await checkIfUserIsSuperAdmin(userId);
        
        if (isAdmin || isSuperAdmin) {
          // For admins, try direct fetch with error handling
          fetchingMethod = 'admin-direct';
          const { data: allCompanies, error: companyError } = await supabase
            .from('empresas')
            .select('*')
            .order('nome');
            
          if (companyError) {
            console.error("Error fetching all companies for admin:", companyError);
            
            // If this fails, try the special admin function
            fetchingMethod = 'admin-fallback';
            const { data: adminCompanies, error: adminError } = await supabase
              .rpc('get_all_companies_for_admin');
              
            if (adminError) {
              console.error("Error using admin company RPC:", adminError);
              throw adminError;
            }
            
            companies = adminCompanies as Company[];
          } else {
            companies = allCompanies as Company[];
          }
        } else {
          // For regular users, try fetching their companies
          fetchingMethod = 'user-relations';
          
          // Get user-company relations directly with error handling
          const { data: relations, error: relationsError } = await supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', userId);
  
          if (relationsError) {
            console.error("Error fetching user-company relations:", relationsError);
            
            // If direct approach fails, try the RPC function
            fetchingMethod = 'user-fallback';
            const { data: userCompanies, error: userCompaniesError } = await supabase
              .rpc('get_user_companies', { user_id: userId });
              
            if (userCompaniesError) {
              console.error("Error using user companies RPC:", userCompaniesError);
              throw userCompaniesError;
            }
            
            companies = userCompanies as Company[];
          } else if (!relations || relations.length === 0) {
            console.log("No companies found for user:", userId);
            setUserCompanies([]);
            setSelectedCompany(null);
            localStorage.removeItem('userCompanies');
            setIsLoading(false);
            return [];
          } else {
            // If we got relations, fetch the companies
            const companyIds = relations.map(r => r.empresa_id);
            console.log(`Found ${companyIds.length} company relations`);
  
            const { data: companiesData, error: companiesError } = await supabase
              .from('empresas')
              .select('*')
              .in('id', companyIds)
              .order('nome');
  
            if (companiesError) {
              console.error("Error fetching companies:", companiesError);
              throw companiesError;
            }
  
            companies = companiesData as Company[];
          }
        }
      } catch (error) {
        console.error(`Error in ${fetchingMethod} company fetching approach:`, error);
        
        // Final fallback: Try a more direct way to fetch companies without going through profiles
        if (cachedData.length === 0) {
          fetchingMethod = 'final-fallback';
          try {
            // This is a last resort approach
            const { data: allAvailableCompanies, error: finalError } = await supabase
              .from('empresas')
              .select('*')
              .limit(10)
              .order('nome');
              
            if (finalError) {
              console.error("Error in final fallback company fetch:", finalError);
              throw finalError;
            }
            
            companies = allAvailableCompanies as Company[];
            console.log(`Retrieved ${companies.length} companies using fallback method`);
          } catch (fallbackError) {
            console.error("All company fetch approaches failed:", fallbackError);
            // We'll use cached data below or return empty array
          }
        }
      }
      
      console.log(`Successfully fetched ${companies.length} companies using ${fetchingMethod} method`);

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
      
      if (cachedData.length > 0) {
        console.log("Using cached data due to error");
        return cachedData;
      }
      
      setIsLoading(false);
      return [];
    }
  };
  
  // Helper function to check if user is admin
  const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('get_is_admin_secure', { user_id: userId });
        
      if (error) {
        console.warn("Error checking admin status:", error);
        return false;
      }
      
      return data === true;
    } catch (e) {
      console.error("Exception checking admin status:", e);
      return false;
    }
  };
  
  // Helper function to check if user is super admin
  const checkIfUserIsSuperAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('get_is_super_admin_secure', { user_id: userId });
        
      if (error) {
        console.warn("Error checking super admin status:", error);
        return false;
      }
      
      return data === true;
    } catch (e) {
      console.error("Exception checking super admin status:", e);
      return false;
    }
  };

  return { getUserCompanies };
};
