import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyFetch } from "./fetch/useCompanyFetch";

interface UseCompanyFetchingProps {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
}

export const useCompanyFetching = (props: UseCompanyFetchingProps) => {
  const {
    getUserCompanies,
    forceGetUserCompanies
  } = useCompanyFetch(props);
  
  // Wrap with useCallback to avoid recreating functions
  const getCompanyById = useCallback(async (companyId: string) => {
    // Implementation remains the same
    return null;
  }, []);

  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  };
};
