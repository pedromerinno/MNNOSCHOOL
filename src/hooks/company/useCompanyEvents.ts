
import { useEffect, useCallback } from 'react';
import { Company } from '@/types/company';

export interface UseCompanyEventsProps {
  userId: string | undefined;
  forceGetUserCompanies: (userId: string) => Promise<any>; // Changed return type to be more flexible
  setDisplayName: (name: string) => void;
}

export const useCompanyEvents = ({ userId, forceGetUserCompanies, setDisplayName }: UseCompanyEventsProps) => {
  const handleCompanyRelationChange = useCallback(async () => {
    if (userId) {
      console.log('CompanySelector: Detectada mudança na relação de empresa, atualizando dados');
      await forceGetUserCompanies(userId);
    }
  }, [userId, forceGetUserCompanies]);

  useEffect(() => {
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('company-updated', (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail.company;
      if (updatedCompany) {
        setDisplayName(updatedCompany.nome);
        localStorage.setItem('selectedCompanyName', updatedCompany.nome);
      }
    });
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('company-updated', () => {});
    };
  }, [handleCompanyRelationChange, setDisplayName]);
};
