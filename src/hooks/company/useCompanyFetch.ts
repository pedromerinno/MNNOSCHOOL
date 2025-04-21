import { useCallback } from 'react';
import { UseCompanyFetchProps } from "./types/fetchTypes";
import { useCompanyList } from "./fetch/useCompanyList";
import { useUserCompanies } from "./fetch/useUserCompanies";
import { useCompanyDetails } from "./fetch/useCompanyDetails";
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

export const useCompanyFetch = (props: UseCompanyFetchProps) => {
  const { fetchCompanies: _fetchCompanies } = useCompanyList(props);
  const { getUserCompanies: _getUserCompanies } = useUserCompanies(props);
  const { getCompanyById: _getCompanyById } = useCompanyDetails(props);

  // Wrap with useCallback to avoid recreating the function
  const fetchCompanies = useCallback(async () => {
    return await _fetchCompanies();
  }, [_fetchCompanies]);

  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      console.log(`[useCompanyFetch] Buscando empresas para usuário: ${userId}`);
      
      // Check if user is a super admin first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('super_admin, is_admin')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('[useCompanyFetch] Error checking user profile:', profileError);
        throw profileError;
      }
      
      // If super admin, return all companies
      if (profileData?.super_admin) {
        console.log('[useCompanyFetch] User is super admin, fetching all companies');
        const { data: allCompanies, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
          
        if (error) throw error;
        return allCompanies as Company[];
      }
      
      // Otherwise, get user's companies
      const companies = await _getUserCompanies(userId, signal);
      console.log(`[useCompanyFetch] Returned ${companies.length} companies for user`);
      return companies;
    } catch (error) {
      console.error('[useCompanyFetch] Error in getUserCompanies:', error);
      throw error;
    }
  }, [_getUserCompanies]);

  const getCompanyById = useCallback(async (companyId: string) => {
    return await _getCompanyById(companyId);
  }, [_getCompanyById]);

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
