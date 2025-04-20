
import { useCallback, useEffect } from 'react';
import { useCompanyState } from './useCompanyState';
import { useCompanyFetching } from './useCompanyFetching';
import { useCompanyModification } from './useCompanyModification';
import { useCompanyEvents } from './useCompanyEvents';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySelection } from './useCompanySelection';

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
    selectCompany: modificationSelectCompany
  } = useCompanyModification({
    companies: companyState.companies,
    setCompanies: companyState.setCompanies,
    userCompanies: companyState.userCompanies,
    setSelectedCompany: companyState.setSelectedCompany,
    setIsLoading: companyState.setIsLoading,
    setError: companyState.setError
  });
  
  const { selectCompany: selectionSelectCompany, persistCompanySelection } = useCompanySelection({
    setSelectedCompany: companyState.setSelectedCompany
  });
  
  useCompanyEvents({
    forceGetUserCompanies
  });
  
  // Unified selectCompany function that ensures proper event propagation
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) return;
    console.log(`useCompaniesProvider: Selecting company ${company.nome}`);
    selectionSelectCompany(userId, company);
  }, [selectionSelectCompany]);
  
  // Initialize on load
  useEffect(() => {
    const initialLoad = async () => {
      if (user?.id && !companyState.initialFetchDone.current) {
        console.log('useCompaniesProvider: Initial loading of user companies for', user.id);
        companyState.initialFetchDone.current = true;
        
        try {
          const companies = await getUserCompanies(user.id);
          
          if (companies && companies.length > 0) {
            // If we have a stored company ID, try to select it
            const storedCompanyId = localStorage.getItem('selectedCompanyId');
            
            if (storedCompanyId) {
              const matchingCompany = companies.find(c => c.id === storedCompanyId);
              if (matchingCompany) {
                console.log(`Found stored company selection: ${matchingCompany.nome}`);
                // Use persistCompanySelection directly to ensure event dispatch
                persistCompanySelection(matchingCompany);
              } else {
                // If stored company not found, select first
                console.log(`Stored company not found, selecting first: ${companies[0].nome}`);
                persistCompanySelection(companies[0]);
              }
            } else {
              // No stored selection, select first
              console.log(`No stored company, selecting first: ${companies[0].nome}`);
              persistCompanySelection(companies[0]);
            }
          }
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
  }, [user?.id, getUserCompanies, forceGetUserCompanies, companyState.initialFetchDone, persistCompanySelection]);
  
  // Ensure we have a company selected when userCompanies changes
  useEffect(() => {
    if (companyState.userCompanies.length > 0 && !companyState.selectedCompany) {
      console.log('No company selected, selecting first company:', companyState.userCompanies[0].nome);
      persistCompanySelection(companyState.userCompanies[0]);
    }
  }, [companyState.userCompanies, companyState.selectedCompany, persistCompanySelection]);
  
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
