
import { Company } from "@/types/company";

export interface UseCompanyFetchProps {
  setIsLoading: (isLoading: boolean) => void;
  setCompanies?: (companies: Company[]) => void;
  setUserCompanies?: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setError: (error: Error | null) => void;
}
