
import { useEffect, useCallback } from 'react';

interface UseCompanyEventsProps {
  userId?: string;
  forceGetUserCompanies: (userId: string) => Promise<any>;
  setDisplayName: (name: string) => void;
}

export const useCompanyEvents = ({
  userId,
  forceGetUserCompanies,
  setDisplayName
}: UseCompanyEventsProps) => {
  const handleCompanyRelationChange = useCallback(async () => {
    if (!userId) return;
    
    console.log(`[useCompanyEvents] Detected company relation change for user ${userId}`);
    try {
      const companies = await forceGetUserCompanies(userId);
      console.log(`[useCompanyEvents] Updated companies after relation change:`, companies?.length || 0);
      
      // Ensure the selected company is valid after the relation change
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      const storedCompanyName = localStorage.getItem('selectedCompanyName');
      
      if (storedCompanyName) {
        setDisplayName(storedCompanyName);
      } else if (companies && companies.length > 0) {
        // If no stored company but companies exist, select the first one
        setDisplayName(companies[0].nome);
        localStorage.setItem('selectedCompanyId', companies[0].id);
        localStorage.setItem('selectedCompanyName', companies[0].nome);
        localStorage.setItem('selectedCompany', JSON.stringify(companies[0]));
      }
    } catch (error) {
      console.error('[useCompanyEvents] Error handling company relation change:', error);
    }
  }, [userId, forceGetUserCompanies, setDisplayName]);

  useEffect(() => {
    // Listen for both the custom event and the standard Event
    const handleEvent = () => {
      console.log('[useCompanyEvents] Company relation change event detected');
      handleCompanyRelationChange();
    };
    
    window.addEventListener('company-relation-changed', handleEvent);
    
    // Also listen for company-selected events
    const handleCompanySelected = (event: any) => {
      const company = event.detail?.company;
      console.log('[useCompanyEvents] Company selected event detected', company?.nome || '');
      if (company?.nome) {
        setDisplayName(company.nome);
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleEvent);
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, [handleCompanyRelationChange, setDisplayName]);
};
