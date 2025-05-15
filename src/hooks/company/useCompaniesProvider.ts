
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./useCompanyState";
import { useCompanyFetching } from "./useCompanyFetching";
import { useCompanyModification } from "./useCompanyModification";
import { useCompanyEvents } from './useCompanyEvents';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    setSelectedCompany,
    ...stateActions
  } = useCompanyState();
  
  const { 
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    setSelectedCompany, // Add missing setSelectedCompany prop
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
    setSelectedCompany, // Add missing setSelectedCompany prop
    ...stateActions
  });

  // Atualizando a chamada do hook para não passar argumentos
  const selectedCompanyFromEvent = useCompanyEvents();
  
  // Use o resultado do hook, se disponível
  useEffect(() => {
    if (selectedCompanyFromEvent) {
      setSelectedCompany(selectedCompanyFromEvent);
    }
  }, [selectedCompanyFromEvent, setSelectedCompany]);

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
