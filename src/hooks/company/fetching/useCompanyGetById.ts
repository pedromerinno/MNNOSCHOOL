
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseCompanyGetByIdProps {
  getCompanyById: (companyId: string) => Promise<Company>;
  userCompanies: Company[];
  fetchedCompaniesRef: React.MutableRefObject<Set<string>>;
  hookInstanceIdRef: React.MutableRefObject<string>;
}

export const useCompanyGetById = (
  getCompanyById: (companyId: string) => Promise<Company>,
  userCompanies: Company[],
  fetchedCompaniesRef: React.MutableRefObject<Set<string>>,
  hookInstanceIdRef: React.MutableRefObject<string>
) => {
  
  const getCompanyByIdOptimized = useCallback(async (companyId: string): Promise<Company | null> => {
    // First check if we already have this company in our user companies array
    const companyFromArray = userCompanies.find(company => company.id === companyId);
    if (companyFromArray) {
      console.log(`[${hookInstanceIdRef.current}] Company ${companyId} found in user companies array`);
      return companyFromArray;
    }
    
    // Check if we've already fetched this company recently (to avoid duplicate fetches)
    const alreadyFetched = fetchedCompaniesRef.current.has(companyId);
    if (alreadyFetched) {
      console.log(`[${hookInstanceIdRef.current}] Company ${companyId} already fetched recently`);
    }
    
    // Always fetch the company by ID (API might handle its own caching)
    try {
      const company = await getCompanyById(companyId);
      if (company) {
        fetchedCompaniesRef.current.add(companyId);
        return company;
      }
    } catch (error) {
      console.error(`[${hookInstanceIdRef.current}] Error fetching company by ID:`, error);
    }
    
    return null;
  }, [getCompanyById, userCompanies, fetchedCompaniesRef, hookInstanceIdRef]);
  
  return {
    getCompanyByIdOptimized
  };
};
