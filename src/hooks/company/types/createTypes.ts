
import { Dispatch, SetStateAction } from 'react';
import { Company } from '@/types/company';

export interface UseCompanyCreateProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
}
