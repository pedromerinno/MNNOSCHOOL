
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
      
      // Check cache validity first
      const cachedCompanies = localStorage.getItem('userCompanies');
      const cachedTimestamp = localStorage.getItem('userCompaniesTimestamp');
      const cachedUserId = localStorage.getItem('userCompaniesUserId');
      const now = Date.now();
      const cacheAge = cachedTimestamp ? now - parseInt(cachedTimestamp) : Infinity;
      const isCacheValid = cachedCompanies && cacheAge < 5 * 60 * 1000 && cachedUserId === userId; // 5 minutes cache
      
      if (isCacheValid) {
        console.log(`[useCompanyFetch] Using cached companies data (${Math.round(cacheAge/1000)}s old)`);
        const companies = JSON.parse(cachedCompanies) as Company[];
        props.setUserCompanies(companies);
        
        // If cache is older than 2 minutes, refresh in background
        if (cacheAge > 2 * 60 * 1000) {
          console.log('[useCompanyFetch] Cache older than 2 minutes, refreshing in background');
          _getUserCompanies(userId, signal).catch(e => 
            console.warn('[useCompanyFetch] Background refresh failed:', e)
          );
        }
        
        return companies;
      }
      
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
        
        // Cache results
        if (allCompanies && allCompanies.length > 0) {
          localStorage.setItem('userCompanies', JSON.stringify(allCompanies));
          localStorage.setItem('userCompaniesTimestamp', now.toString());
          localStorage.setItem('userCompaniesUserId', userId);
          props.setUserCompanies(allCompanies as Company[]);
        }
        
        return allCompanies as Company[];
      }
      
      // Otherwise, get user's companies
      const companies = await _getUserCompanies(userId, signal);
      console.log(`[useCompanyFetch] Returned ${companies.length} companies for user`);
      
      if (companies.length > 0) {
        // Update the selected company if it's not set or not in the list
        const storedCompanyId = localStorage.getItem('selectedCompanyId');
        const storedCompany = localStorage.getItem('selectedCompany');
        
        if ((!storedCompanyId || !storedCompany) && props.setSelectedCompany) {
          console.log('[useCompanyFetch] No selected company, setting first company as default');
          props.setSelectedCompany(companies[0]);
          localStorage.setItem('selectedCompany', JSON.stringify(companies[0]));
          localStorage.setItem('selectedCompanyId', companies[0].id);
          
          // Dispatch company selection event
          try {
            const event = new CustomEvent('company-selected', {
              detail: { company: companies[0] }
            });
            window.dispatchEvent(event);
          } catch (e) {
            console.warn('[useCompanyFetch] Error dispatching company-selected event:', e);
          }
        }
      }
      
      return companies;
    } catch (error) {
      console.error('[useCompanyFetch] Error in getUserCompanies:', error);
      throw error;
    }
  }, [_getUserCompanies, props]);

  const getCompanyById = useCallback(async (companyId: string) => {
    return await _getCompanyById(companyId);
  }, [_getCompanyById]);

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
