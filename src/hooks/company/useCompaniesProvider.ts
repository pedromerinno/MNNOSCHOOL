import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./useCompanyState";
import { useCompanyFetching } from "./useCompanyFetching";
import { useCompanyModification } from "./useCompanyModification";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UseCompanyEventsProps } from "./useCompanyEvents";

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

  // Create a wrapper function for forceGetUserCompanies with the correct signature for useCompanyEvents
  const handleForceGetUserCompanies = async (userId: string): Promise<any> => {
    return await forceGetUserCompanies(userId);
  };

  // Use a function to update selected company
  const handleSetSelectedCompany = (company: any) => {
    stateActions.setSelectedCompany(company);
  };

  // Listen for selected company events
  useCompanyEvents(stateActions.setSelectedCompany);

  // Verificar se o usuário é super admin
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

  // Global data loading - load user companies only when user is logged in
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && (userCompanies.length === 0) && !isLoading && hasCheckedUserRole) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('[useCompanies] Error loading initial company data:', error);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, userCompanies.length, isLoading, getUserCompanies, hasCheckedUserRole]);

  return {
    isLoading,
    companies: Array.isArray(companies) ? companies : [],
    userCompanies: Array.isArray(userCompanies) ? userCompanies : [],
    selectedCompany,
    error,
    fetchCount,
    isSuperAdmin,
    getUserCompanies,
    forceGetUserCompanies: handleForceGetUserCompanies,
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
