
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
      
      // You may want to reset selected company in some cases
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      const storedCompanyName = localStorage.getItem('selectedCompanyName');
      
      if (storedCompanyName) {
        setDisplayName(storedCompanyName);
      }
    } catch (error) {
      console.error('[useCompanyEvents] Error handling company relation change:', error);
    }
  }, [userId, forceGetUserCompanies, setDisplayName]);

  useEffect(() => {
    // Listen for custom company relation change events
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [handleCompanyRelationChange]);
};
