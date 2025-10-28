
import { Company } from "@/types/company";

export interface UseCompanyModificationProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  setUserCompanies?: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  setSelectedCompany: (company: Company | null) => void;
  setError: (error: Error | null) => void;
}
