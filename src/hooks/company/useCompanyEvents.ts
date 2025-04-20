
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseCompanyEventsProps {
  forceGetUserCompanies: (userId: string) => Promise<any>;
}

export const useCompanyEvents = ({
  forceGetUserCompanies
}: UseCompanyEventsProps) => {
  const { user } = useAuth();
  
  // Atualiza as empresas quando uma relação de empresa é alterada
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        console.log('Detected company relation change, reloading companies');
        try {
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('Error reloading companies after relation change:', error);
        }
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [forceGetUserCompanies, user]);
  
  // Força o carregamento de empresas quando solicitado explicitamente
  useEffect(() => {
    const handleForceReload = async () => {
      if (user?.id) {
        console.log('Force reload companies event detected');
        try {
          await forceGetUserCompanies(user.id);
        } catch (error) {
          console.error('Error during forced reload of companies:', error);
        }
      }
    };
    
    // Handle the cleanup event to reset UI state before company changes
    const handleCompanyChanging = () => {
      console.log('Company is changing, cleaning up state...');
      // The event itself serves as a notification to components to clean up
    };
    
    window.addEventListener('force-reload-companies', handleForceReload);
    window.addEventListener('company-changing', handleCompanyChanging);
    
    return () => {
      window.removeEventListener('force-reload-companies', handleForceReload);
      window.removeEventListener('company-changing', handleCompanyChanging);
    };
  }, [forceGetUserCompanies, user]);
};
