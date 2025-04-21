
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
      }
      
      // Reload page to ensure UI is updated with the new company
      if (companies && companies.length > 0) {
        console.log("[useCompanyEvents] Reloading page to ensure UI is updated");
        window.location.reload();
      }
    } catch (error) {
      console.error('[useCompanyEvents] Error handling company relation change:', error);
    }
  }, [userId, forceGetUserCompanies, setDisplayName]);

  useEffect(() => {
    // Listen for both the custom event and the CustomEvent
    const handleEvent = () => {
      console.log('[useCompanyEvents] Company relation change event detected');
      handleCompanyRelationChange();
    };
    
    window.addEventListener('company-relation-changed', handleEvent);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleEvent);
    };
  }, [handleCompanyRelationChange]);
};
