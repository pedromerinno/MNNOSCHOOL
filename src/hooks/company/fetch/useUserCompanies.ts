
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
   * Update the timestamp of the companies cache
   */
  const updateCacheTimestamp = (): void => {
    localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
  };

  /**
   * Fetches all companies a user is related to and automatically selects
   * the first one if there's only one company
   */
  const getUserCompanies = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    // First check if we already have cached data
    const cachedCompanies = localStorage.getItem('userCompanies');
    let cachedData: Company[] = [];
    
    // Use cached data immediately to improve perceived speed
    if (cachedCompanies) {
      try {
        cachedData = JSON.parse(cachedCompanies) as Company[];
        
        // Update state with cached data immediately
        if (setUserCompanies) {
          setUserCompanies(cachedData);
        }
        console.log("Using cached data while fetching update:", cachedData.length, "companies");
        
        // If we have only one company in cache, select it automatically
        if (cachedData.length === 1 && setSelectedCompany) {
          setSelectedCompany(cachedData[0]);
          
          // Pre-load institutional phrase for immediate display
          if (cachedData[0].frase_institucional) {
            // Dispatch event to notify other components about this selection
            const navEvent = new CustomEvent('company-selected', { 
              detail: { userId, company: cachedData[0] } 
            });
            window.dispatchEvent(navEvent);
          }
        }
        
        // If cache is valid and not empty, we can return cached data
        if (isCacheValid() && cachedData.length > 0) {
          console.log("Valid cache, skipping server request");
          setIsLoading(false); // Explicitly set loading to false when using cache
          return cachedData;
        }
      } catch (e) {
        console.error("Error parsing cached companies", e);
      }
    }

    // Set loading indicator only if we don't have cached data
    if (cachedData.length === 0) {
      setIsLoading(true);
    }

    try {
      // Check if request has been aborted
      if (signal?.aborted) {
        console.log("Request was aborted before it started");
        throw new DOMException("Aborted", "AbortError");
      }
      
      // Create the fetch options with the abort signal
      const fetchOptions = signal ? { signal } : undefined;

      // Fetch company ids
      const userCompanyRelations = await retryOperation(
        async () => {
          const req = supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', userId);
            
          // Add abort signal to the request if available  
          if (signal) {
            req.abortSignal(signal);
          }
          
          return await req;
        }
      );

      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      if (userCompanyRelations.error) {
        console.error("Error fetching user company relations:", userCompanyRelations.error);
        setError(new Error(userCompanyRelations.error.message || "Failed to fetch company relations"));
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        
        setIsLoading(false);
        return [];
      }

      if (!userCompanyRelations.data || userCompanyRelations.data.length === 0) {
        console.log("No company relations found for user", userId);
        if (setUserCompanies) {
          setUserCompanies([]);
        }
        if (setSelectedCompany) {
          setSelectedCompany(null);
        }
        localStorage.removeItem('userCompanies');
        localStorage.removeItem('userCompaniesTimestamp');
        setIsLoading(false);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.data.map(relation => relation.empresa_id);
      console.log("Found company IDs for user:", companyIds);

      // Check if request has been aborted again
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await retryOperation(
        async () => {
          const req = supabase
            .from('empresas')
            .select('*')
            .in('id', companyIds)
            .order('nome');
            
          // Add abort signal to the request if available  
          if (signal) {
            req.abortSignal(signal);
          }
          
          return await req;
        }
      );

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        setError(new Error(companiesError.message || "Failed to fetch company details"));
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        
        setIsLoading(false);
        return [];
      }

      const userCompaniesData = companies as Company[];
      console.log("Fetched companies:", userCompaniesData.length);
      if (setUserCompanies) {
        setUserCompanies(userCompaniesData);
      }
      
      // Cache the companies for offline fallback and update timestamp
      if (userCompaniesData.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(userCompaniesData));
        updateCacheTimestamp();
      }
      
      // If there's only one company, automatically select it
      if (userCompaniesData.length === 1 && setSelectedCompany) {
        setSelectedCompany(userCompaniesData[0]);
        
        // Dispatch event to notify other components about this selection
        const navEvent = new CustomEvent('company-selected', { 
          detail: { userId, company: userCompaniesData[0] } 
        });
        window.dispatchEvent(navEvent);
      }
      
      setIsLoading(false);
      return userCompaniesData;
    } catch (error) {
      // Don't show errors for aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted during execution');
        setIsLoading(false);
        return cachedData;
      }
      
      console.error("Unexpected error:", error);
      setError(error instanceof Error ? error : new Error("An error occurred while fetching companies"));
      
      // Return cached data in case of error
      if (cachedData.length > 0) {
        console.log("Using cached companies due to error");
        setIsLoading(false);
        return cachedData;
      }
      
      setIsLoading(false);
      return [];
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  return { getUserCompanies };
};
