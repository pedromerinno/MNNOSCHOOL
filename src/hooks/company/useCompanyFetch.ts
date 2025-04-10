
import { useCallback } from 'react';
import { UseCompanyFetchProps } from "./types/fetchTypes";
import { useCompanyList } from "./fetch/useCompanyList";
import { useUserCompanies } from "./fetch/useUserCompanies";
import { useCompanyDetails } from "./fetch/useCompanyDetails";

export const useCompanyFetch = (props: UseCompanyFetchProps) => {
  const { fetchCompanies: _fetchCompanies } = useCompanyList(props);
  const { getUserCompanies: _getUserCompanies } = useUserCompanies(props);
  const { getCompanyById: _getCompanyById } = useCompanyDetails(props);

  // Envolver com useCallback para evitar recriações da função
  const fetchCompanies = useCallback(async () => {
    return await _fetchCompanies();
  }, [_fetchCompanies]);

  const getUserCompanies = useCallback(async (userId: string) => {
    return await _getUserCompanies(userId);
  }, [_getUserCompanies]);

  const getCompanyById = useCallback(async (companyId: string) => {
    return await _getCompanyById(companyId);
  }, [_getCompanyById]);

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
