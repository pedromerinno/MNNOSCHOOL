
import { useState, useRef } from 'react';
import { Company } from "@/types/company";
import { ErrorState } from './types';

export type LoadingState = {
  isLoading: boolean;
  isFetchingCompanies: boolean;
  isUpdatingCompany: boolean;
  isRefreshing: boolean;
};

export const useCompanyState = () => {
  // Loading states
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    isFetchingCompanies: false,
    isUpdatingCompany: false,
    isRefreshing: false,
  });

  // Company related states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Error handling
  const [error, setError] = useState<ErrorState | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const initialFetchDone = useRef(false);

  // Loading state setters
  const setIsLoading = (loading: boolean) => {
    setLoadingState(prev => ({ ...prev, isLoading: loading }));
  };

  const setIsFetchingCompanies = (fetching: boolean) => {
    setLoadingState(prev => ({ ...prev, isFetchingCompanies: fetching }));
  };

  const setIsUpdatingCompany = (updating: boolean) => {
    setLoadingState(prev => ({ ...prev, isUpdatingCompany: updating }));
  };

  const setIsRefreshing = (refreshing: boolean) => {
    setLoadingState(prev => ({ ...prev, isRefreshing: refreshing }));
  };

  // Error handling
  const setErrorWithContext = (error: Error | null) => {
    if (error) {
      setError({
        message: error.message,
        code: error instanceof Error ? error.name : 'UnknownError',
        timestamp: Date.now(),
      });
    } else {
      setError(null);
    }
  };

  // Function to increment request counter
  const incrementFetchCount = () => setFetchCount(prevCount => prevCount + 1);
  
  // Function to reset error
  const resetError = () => setError(null);

  return {
    // Loading states
    ...loadingState,
    setIsLoading,
    setIsFetchingCompanies,
    setIsUpdatingCompany,
    setIsRefreshing,
    
    // Company states
    companies,
    setCompanies,
    userCompanies,
    setUserCompanies,
    selectedCompany,
    setSelectedCompany,
    
    // Error and fetch states
    error,
    setError: setErrorWithContext,
    fetchCount,
    incrementFetchCount,
    resetError,
    initialFetchDone,
  };
};
