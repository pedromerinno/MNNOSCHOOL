
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
    const controller = signal ? null : new AbortController();
    const abortSignal = signal || controller?.signal;
    
    try {
      console.log(`[useUserCompanies] Buscando empresas para usuário: ${userId}`);
      setIsLoading(true);
      
      // First try to use the RPC function which handles permissions correctly
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_companies', { user_id: userId });
        
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`[useUserCompanies] Encontradas ${rpcData.length} empresas via RPC`);
        setUserCompanies(rpcData as Company[]);
        return rpcData as Company[];
      }
      
      if (rpcError) {
        console.warn('[useUserCompanies] Error using RPC, falling back to direct query:', rpcError);
      }
      
      // Fallback to direct query if RPC not available or failed or returned no data
      const { data: relations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error('[useUserCompanies] Error fetching user-company relations:', relationsError);
        throw relationsError;
      }
      
      console.log(`[useUserCompanies] Encontrados ${relations?.length || 0} relacionamentos empresa`);
      
      if (!relations || relations.length === 0) {
        console.log(`[useUserCompanies] Nenhuma empresa associada ao usuário ${userId}`);
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
      
      console.log(`[useUserCompanies] Carregados detalhes de ${companies?.length || 0} empresas`);
      
      if (companies && companies.length > 0) {
        // Save to local cache for faster loading next time
        try {
          localStorage.setItem('userCompanies', JSON.stringify(companies));
          localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
        } catch (e) {
          console.warn('[useUserCompanies] Failed to cache companies to localStorage:', e);
        }
        
        // Log company names for debugging
        companies.forEach(company => {
          console.log(`[useUserCompanies] Empresa carregada: ${company.nome} (${company.id})`);
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
      controller?.abort();
    }
  }, [setUserCompanies, setError, setIsLoading]);

  return { getUserCompanies };
};
