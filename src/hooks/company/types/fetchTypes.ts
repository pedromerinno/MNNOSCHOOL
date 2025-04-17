
export interface UseCompanyFetchProps {
  setIsLoading: (isLoading: boolean) => void;
  setCompanies?: (companies: any[]) => void;
  setUserCompanies?: (companies: any[]) => void;
  setSelectedCompany?: (company: any | null) => void;
  setError: (error: Error | null) => void;
}
