
import { useCallback } from 'react';
import { UseCompanyFetchProps } from "./types/fetchTypes";
import { useCompanyList } from "./fetch/useCompanyList";
import { useUserCompanies } from "./fetch/useUserCompanies";
import { useCompanyDetails } from "./fetch/useCompanyDetails";

export const useCompanyFetch = (props: UseCompanyFetchProps) => {
  const { fetchCompanies: _fetchCompanies } = useCompanyList(props);
  const { getUserCompanies: _getUserCompanies } = useUserCompanies(props);
  const { getCompanyById: _getCompanyById } = useCompanyDetails(props);

  const fetchCompanies = useCallback(async () => {
    try {
      return await _fetchCompanies();
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      // Tentar novamente após um curto intervalo em caso de erro
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await _fetchCompanies();
    }
  }, [_fetchCompanies]);

  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      return await _getUserCompanies(userId, signal);
    } catch (error) {
      console.error("Erro ao buscar empresas do usuário:", error);
      // Tentar novamente após um curto intervalo em caso de erro
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await _getUserCompanies(userId, signal);
    }
  }, [_getUserCompanies]);

  const getCompanyById = useCallback(async (companyId: string) => {
    try {
      return await _getCompanyById(companyId);
    } catch (error) {
      console.error("Erro ao buscar empresa por ID:", error);
      // Tentar novamente após um curto intervalo em caso de erro
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await _getCompanyById(companyId);
    }
  }, [_getCompanyById]);

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
