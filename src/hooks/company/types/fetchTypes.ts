
import { Company } from '@/types/company';
import { Dispatch, SetStateAction } from 'react';

export interface UseCompanyFetchProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies?: Dispatch<SetStateAction<Company[]>>;
  setUserCompanies?: Dispatch<SetStateAction<Company[]>>;
  setSelectedCompany?: Dispatch<SetStateAction<Company | null>>;
  setError: Dispatch<SetStateAction<Error | null>>;
}

export interface UseCompanyFetchingProps {
  userCompanies: Company[];
  setUserCompanies: Dispatch<SetStateAction<Company[]>>;
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<Error | null>>;
  incrementFetchCount: () => void;
}
