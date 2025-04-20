
import { useCallback } from 'react';
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
  
  return {
    // State
    ...companyState,
    
    // User from auth context
    user,
    
    // Fetching methods
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    
    // Modification methods
    createCompany,
    updateCompany,
    deleteCompany,
    fetchCompanies,
    selectCompany
  };
};
