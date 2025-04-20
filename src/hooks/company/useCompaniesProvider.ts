import { useCallback, useEffect } from 'react';
import { useCompanyState } from './useCompanyState';
import { useCompanyFetching } from './useCompanyFetching';
import { useCompanyModification } from './useCompanyModification';
import { useCompanyEvents } from './useCompanyEvents';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';

export const useCompaniesProvider = () => {
  const { user } = useAuth();
  const companyState = useCompanyState();
  
  const {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies: companyState.userCompanies,
    setUserCompanies: companyState.setUserCompanies,
    setSelectedCompany: companyState.setSelectedCompany,
    setIsLoading: companyState.setIsLoading,
    setError: companyState.setError,
    incrementFetchCount: companyState.incrementFetchCount
  });
  
  const {
    createCompany,
    updateCompany,
    deleteCompany,
    fetchCompanies,
    selectCompany
  } = useCompanyModification({
    companies: companyState.companies,
    setCompanies: companyState.setCompanies,
    userCompanies: companyState.userCompanies,
    setSelectedCompany: companyState.setSelectedCompany,
    setIsLoading: companyState.setIsLoading,
    setError: companyState.setError
  });
  
  useCompanyEvents({
    forceGetUserCompanies
  });
  
  useEffect(() => {
    const initialLoad = async () => {
      if (user?.id && !companyState.initialFetchDone.current) {
        console.log('useCompaniesProvider: Initial loading of user companies for', user.id);
        companyState.initialFetchDone.current = true;
        
        try {
          await getUserCompanies(user.id);
          
          window.dispatchEvent(new Event('reload-company-videos'));
          window.dispatchEvent(new Event('reload-company-documents'));
          window.dispatchEvent(new Event('reload-company-roles'));
          window.dispatchEvent(new Event('reload-company-courses'));
        } catch (error) {
          console.error('Error in initial load of user companies:', error);
          try {
            console.log('Retrying initial load after failure');
            await forceGetUserCompanies(user.id);
          } catch (retryError) {
            console.error('Retry of initial load also failed:', retryError);
          }
        }
      }
    };
    
    initialLoad();
  }, [user?.id, getUserCompanies, forceGetUserCompanies, companyState.initialFetchDone]);
  
  useEffect(() => {
    if (companyState.userCompanies.length > 0 && !companyState.selectedCompany) {
      console.log('No company selected, selecting first company:', companyState.userCompanies[0].nome);
      companyState.setSelectedCompany(companyState.userCompanies[0]);
      
      window.dispatchEvent(new CustomEvent('company-selected', {
        detail: { company: companyState.userCompanies[0] }
      }));
    }
  }, [companyState.userCompanies, companyState.selectedCompany, companyState.setSelectedCompany]);
  
  return {
    ...companyState,
    user,
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    fetchCompanies,
    selectCompany
  };
};
