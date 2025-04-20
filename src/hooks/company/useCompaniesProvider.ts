
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
  
  // Adicionar um efeito para carregar as empresas do usuário na inicialização
  useEffect(() => {
    const initialLoad = async () => {
      if (user?.id && !companyState.initialFetchDone.current) {
        console.log('useCompaniesProvider: Initial loading of user companies for', user.id);
        companyState.initialFetchDone.current = true;
        
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Error in initial load of user companies:', error);
        }
      }
    };
    
    initialLoad();
  }, [user?.id, getUserCompanies, companyState.initialFetchDone]);
  
  // Selecionar a primeira empresa quando as empresas são carregadas e nenhuma está selecionada
  useEffect(() => {
    if (companyState.userCompanies.length > 0 && !companyState.selectedCompany) {
      console.log('No company selected, displaying first company:', companyState.userCompanies[0].nome);
      companyState.setSelectedCompany(companyState.userCompanies[0]);
    }
  }, [companyState.userCompanies, companyState.selectedCompany, companyState.setSelectedCompany]);
  
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
