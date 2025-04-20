
import { useEffect } from "react";

interface UseCompanyEventsProps {
  forceGetUserCompanies: (userId: string) => Promise<any>;
}

export const useCompanyEvents = ({ forceGetUserCompanies }: UseCompanyEventsProps) => {
  // Setup listeners for company-related events
  useEffect(() => {
    const handleForceReloadCompanies = async (event: CustomEvent) => {
      const userId = event.detail?.userId;
      if (userId) {
        console.log(`useCompanyEvents: Force reload companies for user ${userId}`);
        try {
          await forceGetUserCompanies(userId);
        } catch (err) {
          console.error("Error handling force-reload-companies event:", err);
        }
      } else {
        console.warn("force-reload-companies event received but no userId provided");
      }
    };

    const handleCompanyRelationChanged = async (event: Event) => {
      try {
        // Get current user from local storage or other state management
        const storedUser = localStorage.getItem('supabase.auth.token');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData?.currentSession?.user?.id;
          
          if (userId) {
            console.log(`useCompanyEvents: Company relation changed, reloading for user ${userId}`);
            await forceGetUserCompanies(userId);
          }
        }
      } catch (err) {
        console.error("Error handling company-relation-changed event:", err);
      }
    };

    // Register event listeners
    window.addEventListener('force-reload-companies', handleForceReloadCompanies as EventListener);
    window.addEventListener('company-relation-changed', handleCompanyRelationChanged);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('force-reload-companies', handleForceReloadCompanies as EventListener);
      window.removeEventListener('company-relation-changed', handleCompanyRelationChanged);
    };
  }, [forceGetUserCompanies]);
};
