
import { UseCompanyFetchProps } from "./types/fetchTypes";
import { useCompanyList } from "./fetch/useCompanyList";
import { useUserCompanies } from "./fetch/useUserCompanies";
import { useCompanyDetails } from "./fetch/useCompanyDetails";

export const useCompanyFetch = (props: UseCompanyFetchProps) => {
  const { fetchCompanies } = useCompanyList(props);
  const { getUserCompanies } = useUserCompanies(props);
  const { getCompanyById } = useCompanyDetails(props);

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
