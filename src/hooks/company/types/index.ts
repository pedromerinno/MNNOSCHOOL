
import { Company } from "@/types/company";
import { User } from "@supabase/supabase-js";

export interface ErrorState {
  message: string;
  code?: string;
  timestamp?: number;
}

export interface UseCompaniesReturn {
  // Data states
  companies: Company[];
  userCompanies: Company[];
  selectedCompany: Company | null;
  user: User | null;
  
  // Loading and error states
  isLoading: boolean;
  error: ErrorState | null;
  fetchCount: number;
  
  // Fetch operations
  getUserCompanies: (userId: string, forceRefresh?: boolean) => Promise<Company[]>;
  forceGetUserCompanies: (userId: string) => Promise<Company[]>;
  getCompanyById: (companyId: string) => Promise<Company | null>;
  
  // Modification operations
  fetchCompanies: () => Promise<Company[]>;
  createCompany: (companyData: Partial<Company>) => Promise<Company | null>;
  updateCompany: (companyId: string, companyData: Partial<Company>) => Promise<Company | null>;
  deleteCompany: (companyId: string) => Promise<boolean>;
  selectCompany: (userId: string, company: Company) => void;
  
  // Selection operations
  getStoredCompanyId: () => string | null;
  getStoredCompany: () => Company | null;
}
