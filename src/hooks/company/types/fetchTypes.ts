
import { Company } from "@/types/company";

export interface UseCompanyFetchProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setError: (error: Error | null) => void;
}

export interface UseCompanyFetchingProps extends UseCompanyFetchProps {
  userCompanies: Company[];
  incrementFetchCount: () => void;
}
