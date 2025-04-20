
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseCompanyEventsProps {
  forceGetUserCompanies: (userId: string) => Promise<any>;
}

export const useCompanyEvents = ({ forceGetUserCompanies }: UseCompanyEventsProps) => {
  const { user } = useAuth();
  
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        console.log('Company relation change detected, refreshing data');
        await forceGetUserCompanies(user.id);
      }
    };
    
    // Listen for company relation changes (like when a user is added to or removed from a company)
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [user, forceGetUserCompanies]);
  
  return {};
};
