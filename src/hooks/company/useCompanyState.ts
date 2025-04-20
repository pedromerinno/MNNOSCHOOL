
import { useState } from "react";
import { Company } from "@/types/company";

export const useCompanyState = () => {
  // Basic company management states
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Function to increment request counter
  const incrementFetchCount = () => setFetchCount(prevCount => prevCount + 1);
  
  // Function to reset error
  const resetError = () => setError(null);
  
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
    setIsSuperAdmin
  };
};
