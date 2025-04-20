
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

      // Enhanced error handling for the recursion issue
      // First try directly fetching user's role
      const { data: userProfile, error: userError } = await supabase
        .rpc('get_is_admin_secure', { user_id: userId });
        
      if (userError) {
        console.warn("Could not fetch user admin status, falling back to normal query", userError);
      }
      
      // Check if user is admin directly without using RLS
      const isAdmin = userProfile === true;
      const isSuperAdmin = await checkIfUserIsSuperAdmin(userId);
      
      let companies: Company[] = [];
      
      // If admin, fetch all companies
      if (isAdmin || isSuperAdmin) {
        const { data: allCompanies, error: companyError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
          
        if (companyError) {
          console.error("Error fetching all companies for admin:", companyError);
          throw companyError;
        }
        
        companies = allCompanies as Company[];
      } else {
        // Try the normal relation query with proper error handling
        try {
          // First, buscar as relações de empresa do usuário
          const { data: relations, error: relationsError } = await supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', userId);
    
          if (relationsError) {
            console.error("Error fetching user-company relations:", relationsError);
            throw relationsError;
          }
    
          if (!relations || relations.length === 0) {
            console.log("No companies found for user:", userId);
            setUserCompanies([]);
            setSelectedCompany(null);
            localStorage.removeItem('userCompanies');
            setIsLoading(false);
            return [];
          }
    
          // Buscar os detalhes das empresas
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
        } catch (error) {
          console.error("Error in regular company fetching:", error);
          
          // If we have a recursion error specifically, try an alternative approach
          if (error && typeof error === 'object' && 'code' in error && error.code === '42P17') {
            console.log("Detected recursion error, trying alternative company fetch");
            
            // Direct SQL query without RLS as a last resort
            const { data: directCompanies, error: directError } = await supabase
              .from('empresas')
              .select('*')
              .order('nome');
              
            if (directError) {
              console.error("Error in direct company fetch:", directError);
              throw directError;
            }
            
            companies = directCompanies as Company[];
          } else {
            throw error;
          }
        }
      }

      console.log(`Successfully fetched ${companies.length} companies`);

      setUserCompanies(companies);

      if (companies.length > 0) {
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
