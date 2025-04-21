
import { Company } from "@/types/company";

export interface UseCompanyStateReturn {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  fetchCount: number;
  incrementFetchCount: () => void;
  resetError: () => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (isSuperAdmin: boolean) => void;
  companyContentLoaded: boolean;
  setCompanyContentLoaded: (loaded: boolean) => void;
}
