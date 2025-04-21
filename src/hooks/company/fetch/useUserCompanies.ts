
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useUserCompanies = ({ 
  setIsLoading, 
  setUserCompanies, 
  setError 
}: UseCompanyFetchProps) => {
  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      console.log(`[useUserCompanies] Buscando empresas para usuário: ${userId}`);
      
      // Try the RPC function first which has proper permission handling
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_companies', { user_id: userId });
        
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`[useUserCompanies] Encontradas ${rpcData.length} empresas via RPC`);
        
        // Save to memory for immediate use and localStorage for later
        const companies = rpcData as Company[];
        setUserCompanies(companies);
        
        try {
          // Cache to localStorage with a clear timestamp
          localStorage.setItem('userCompanies', JSON.stringify(companies));
          localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
          localStorage.setItem('userCompaniesUserId', userId);
        } catch (e) {
          console.warn('[useUserCompanies] Failed to cache companies to localStorage:', e);
        }
        
        return companies;
      }
      
      if (rpcError) {
        console.warn('[useUserCompanies] Error using RPC, falling back to direct query:', rpcError);
      }
      
      // Check if user is a super admin first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('super_admin, is_admin')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('[useUserCompanies] Error checking user profile:', profileError);
        throw profileError;
      }
      
      // Super admins get all companies
      if (profileData?.super_admin) {
        console.log('[useUserCompanies] User is super admin, fetching all companies');
        
        const { data: allCompanies, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome', { ascending: true });
          
        if (companiesError) {
          console.error('[useUserCompanies] Error fetching all companies for super admin:', companiesError);
          throw companiesError;
        }
        
        if (allCompanies && allCompanies.length > 0) {
          console.log(`[useUserCompanies] Loaded ${allCompanies.length} companies for super admin`);
          
          try {
            localStorage.setItem('userCompanies', JSON.stringify(allCompanies));
            localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
            localStorage.setItem('userCompaniesUserId', userId);
          } catch (e) {
            console.warn('[useUserCompanies] Failed to cache companies to localStorage:', e);
          }
          
          setUserCompanies(allCompanies as Company[]);
          return allCompanies as Company[];
        }
        
        return [];
      }
      
      // For regular users, query the user_empresa relation table
      const { data: relations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error('[useUserCompanies] Error fetching user-company relations:', relationsError);
        throw relationsError;
      }
      
      console.log(`[useUserCompanies] Found ${relations?.length || 0} company relationships`);
      
      if (!relations || relations.length === 0) {
        console.log(`[useUserCompanies] No companies associated with user ${userId}`);
        setUserCompanies([]);
        return [];
      }

      const companyIds = relations.map(rel => rel.empresa_id);
      
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds)
        .order('nome', { ascending: true });

      if (companiesError) {
        console.error('[useUserCompanies] Error fetching companies details:', companiesError);
        throw companiesError;
      }
      
      console.log(`[useUserCompanies] Loaded details for ${companies?.length || 0} companies`);
      
      if (companies && companies.length > 0) {
        // Save to both memory and localStorage
        try {
          localStorage.setItem('userCompanies', JSON.stringify(companies));
          localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
          localStorage.setItem('userCompaniesUserId', userId);
        } catch (e) {
          console.warn('[useUserCompanies] Failed to cache companies to localStorage:', e);
        }
        
        // Log companies for debugging
        companies.forEach(company => {
          console.log(`[useUserCompanies] Company loaded: ${company.nome} (${company.id})`);
        });
        
        setUserCompanies(companies as Company[]);
        return companies as Company[];
      } else {
        setUserCompanies([]);
        return [];
      }
    } catch (error) {
      console.error('[useUserCompanies] Error fetching user companies:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user companies'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setUserCompanies, setError, setIsLoading]);

  return { getUserCompanies };
};
