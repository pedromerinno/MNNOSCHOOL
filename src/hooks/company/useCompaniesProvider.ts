
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./useCompanyState";
import { useCompanyFetching } from "./useCompanyFetching";
import { useCompanyModification } from "./useCompanyModification";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyEvents } from "./useCompanyEvents";

export const useCompaniesProvider = () => {
  const { user } = useAuth();
  const [hasCheckedUserRole, setHasCheckedUserRole] = useState(false);
  
  const {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    isSuperAdmin,
    setIsSuperAdmin,
    ...stateActions
  } = useCompanyState();
  
  const { 
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    ...stateActions
  });
  
  const {
    fetchCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany
  } = useCompanyModification({
    ...stateActions
  });

  const handleForceGetUserCompanies = async (userId: string): Promise<any> => {
    return await forceGetUserCompanies(userId);
  };

  const companyEventsProps = {
    userId: user?.id,
    forceGetUserCompanies: handleForceGetUserCompanies,
    setDisplayName: (name: string) => {
      localStorage.setItem('selectedCompanyName', name);
    }
  };

  useCompanyEvents(companyEventsProps);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.id && !hasCheckedUserRole) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('super_admin')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          setIsSuperAdmin(data?.super_admin === true);
          setHasCheckedUserRole(true);
        } catch (error) {
          console.error('[useCompanies] Error checking user role:', error);
          setHasCheckedUserRole(true);
        }
      }
    };
    
    checkUserRole();
  }, [user?.id, hasCheckedUserRole, setIsSuperAdmin]);

  return {
    isLoading,
    companies,
    userCompanies,
    selectedCompany,
    error,
    fetchCount,
    isSuperAdmin,
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    fetchCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    assignUserToCompany,
    removeUserFromCompany,
    user
  };
};
