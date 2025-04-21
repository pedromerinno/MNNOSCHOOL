
import { useEffect, useCallback } from 'react';
import { Company } from '@/types/company';

export interface UseCompanyEventsProps {
  userId: string | undefined;
  forceGetUserCompanies: (userId: string) => Promise<any>;
  setDisplayName: (name: string) => void;
}

export const useCompanyEvents = ({ userId, forceGetUserCompanies, setDisplayName }: UseCompanyEventsProps) => {
  const handleCompanyRelationChange = useCallback(async () => {
    if (userId) {
      console.log('CompanySelector: Detected company relation change, updating data');
      await forceGetUserCompanies(userId);
    }
  }, [userId, forceGetUserCompanies]);

  const handleCompanyUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const updatedCompany = customEvent.detail?.company;
    
    if (updatedCompany) {
      console.log(`[useCompanyEvents] Company updated event detected ${updatedCompany.nome}`);
      setDisplayName(updatedCompany.nome);
      localStorage.setItem('selectedCompanyName', updatedCompany.nome);
    }
  }, [setDisplayName]);

  useEffect(() => {
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
    };
  }, [handleCompanyRelationChange, handleCompanyUpdate]);
};
