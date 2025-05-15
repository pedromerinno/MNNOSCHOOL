
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyGetById = (
  getCompanyById: (companyId: string) => Promise<Company | null>,
  userCompanies: Company[],
  fetchedCompaniesRef: React.MutableRefObject<Set<string>>,
  hookInstanceIdRef: React.MutableRefObject<string>
) => {
  const getCompanyByIdOptimized = useCallback(async (companyId: string): Promise<Company | null> => {
    // Fast path: check memory cache first
    if (fetchedCompaniesRef.current.has(companyId) && userCompanies.length > 0) {
      const existingCompany = userCompanies.find(company => company.id === companyId);
      if (existingCompany) {
        console.log(`[${hookInstanceIdRef.current}] Company ${companyId} found in memory cache`);
        return existingCompany;
      }
    }
    
    try {
      const company = await getCompanyById(companyId);
      if (company) {
        fetchedCompaniesRef.current.add(companyId);
      }
      return company;
    } catch (error) {
      console.error(`[${hookInstanceIdRef.current}] Error fetching company by ID:`, error);
      return null;
    }
  }, [getCompanyById, userCompanies, fetchedCompaniesRef, hookInstanceIdRef]);

  return { getCompanyByIdOptimized };
};
