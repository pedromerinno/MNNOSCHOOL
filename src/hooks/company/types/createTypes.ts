
import { Company } from "@/types/company";

export interface UseCompanyCreateProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
}
