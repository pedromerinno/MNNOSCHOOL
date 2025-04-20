
import { Company } from "@/types/company";
import { useCompanyFetchOperations } from "./fetch/useCompanyFetchOperations";
import { UseCompanyFetchingProps } from "./types/fetchTypes";

export const useCompanyFetching = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchingProps) => {
  return useCompanyFetchOperations({
    userCompanies,
    setUserCompanies,
    setSelectedCompany,
    setIsLoading,
    setError,
    incrementFetchCount
  });
};
