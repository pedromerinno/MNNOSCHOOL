
import { useState, useCallback } from "react";
import { UseCompanyStateReturn } from "./types/stateTypes";
import { Company } from "@/types/company";

export const useCompanyState = (): UseCompanyStateReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState<number>(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [companyContentLoaded, setCompanyContentLoaded] = useState<boolean>(false);

  const incrementFetchCount = useCallback(() => {
    setFetchCount((prev) => prev + 1);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    setIsLoading,
    companies,
    setCompanies,
    userCompanies,
    setUserCompanies,
    selectedCompany,
    setSelectedCompany,
    error,
    setError,
    fetchCount,
    incrementFetchCount,
    resetError,
    isSuperAdmin,
    setIsSuperAdmin,
    companyContentLoaded,
    setCompanyContentLoaded
  };
};
