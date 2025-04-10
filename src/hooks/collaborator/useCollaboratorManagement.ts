
import { useEffect, useCallback } from 'react';
import { Company } from "@/types/company";
import { useUsers } from "@/hooks/useUsers";
import { useCollaboratorState } from './useCollaboratorState';
import { useFetchCompanyUsers } from './useFetchCompanyUsers';
import { useCompanyUserRelationship } from './useCompanyUserRelationship';
import { useFilterUsers } from './useFilterUsers';
import { CollaboratorData } from './types';

export const useCollaboratorManagement = (company: Company | null): CollaboratorData => {
  const { users: allUsers, loading: loadingUsers, fetchUsers } = useUsers();
  
  // Get state management and actions
  const {
    isLoading,
    companyUsers,
    searchTerm,
    userRoles,
    reloadTrigger,
    setIsLoading,
    setCompanyUsers,
    setUserRoles,
    setSearchTerm,
    setReloadTrigger,
    initialFetchDone
  } = useCollaboratorState();

  // Get company users fetching functionality
  const { fetchCompanyUsers } = useFetchCompanyUsers(
    setCompanyUsers,
    setIsLoading,
    setUserRoles,
    initialFetchDone
  );

  // Get user-company relationship management
  const { addUserToCompany: addUser, removeUserFromCompany: removeUser } = 
    useCompanyUserRelationship(setCompanyUsers, setUserRoles, setReloadTrigger);

  // Get filtered users
  const { availableUsers, filteredCompanyUsers } = 
    useFilterUsers(allUsers, companyUsers, searchTerm);

  // Wrapper functions to include company
  const addUserToCompany = useCallback((userId: string) => {
    return addUser(userId, company);
  }, [addUser, company]);

  const removeUserFromCompany = useCallback((userId: string) => {
    return removeUser(userId, company);
  }, [removeUser, company]);

  // Load data when component mounts and when company changes
  useEffect(() => {
    if (company && company.id) {
      console.log(`Company changed or reload triggered: ${company.nome} (${reloadTrigger})`);
      fetchCompanyUsers(company);
    }
  }, [company, reloadTrigger, fetchCompanyUsers]);
  
  // Ensure users are loaded
  useEffect(() => {
    if (allUsers.length === 0 && !loadingUsers) {
      console.log("Loading users in CollaboratorsManagement");
      fetchUsers();
    }
  }, [allUsers, loadingUsers, fetchUsers]);
  
  // Listen for company selection events and reload data
  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("CollaboratorsManagement: Company change event detected");
      // Force a refresh of company users data
      setReloadTrigger(prev => prev + 1);
    };
    
    const handleSettingsCompanyChanged = (event: CustomEvent<{company: Company}>) => {
      console.log("Settings company changed event detected:", event.detail.company.nome);
      // Just trigger a reload of the data
      setReloadTrigger(prev => prev + 1);
    };
    
    window.addEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
    window.addEventListener('company-relation-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
      window.removeEventListener('company-relation-changed', handleCompanyChange);
    };
  }, [setReloadTrigger]);

  console.log(`Company users count: ${companyUsers.length}, Filtered company users: ${filteredCompanyUsers.length}`);

  return {
    isLoading,
    loadingUsers,
    allUsers,
    companyUsers,
    filteredCompanyUsers,
    availableUsers,
    userRoles,
    searchTerm,
    reloadTrigger, // Add the missing reloadTrigger property here
    setSearchTerm,
    addUserToCompany,
    removeUserFromCompany,
    setReloadTrigger
  };
};
