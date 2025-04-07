
import { useState } from "react";
import { Company } from "@/types/company";

export const useCompanyState = () => {
  // Estados básicos para gerenciamento de empresas
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  
  // Função para incrementar o contador de requisições
  const incrementFetchCount = () => setFetchCount(prevCount => prevCount + 1);
  
  // Função para resetar o erro
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
    resetError
  };
};
