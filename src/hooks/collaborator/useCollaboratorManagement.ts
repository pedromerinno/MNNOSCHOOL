
import { useEffect, useCallback, useState } from 'react';
import { Company } from "@/types/company";
import { useUsers } from "@/hooks/useUsers";
import { useCollaboratorState } from './useCollaboratorState';
import { useFetchCompanyUsers } from './useFetchCompanyUsers';
import { useCompanyUserRelationship } from './useCompanyUserRelationship';
import { useFilterUsers } from './useFilterUsers';
import { CollaboratorData } from './types';

export const useCollaboratorManagement = (company: Company | null): CollaboratorData => {
  const { users: allUsers, loading: loadingUsers, fetchUsers } = useUsers();
  const [userProfiles, setUserProfiles] = useState([]);
  
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
  const { fetchCompanyUsers, fetchFullUserProfiles } = useFetchCompanyUsers(
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

  // Load data when component mounts and when company or reload trigger changes
  useEffect(() => {
    const loadCompanyUsers = async () => {
      if (company && company.id) {
        console.log(`Loading company users for ${company.nome} (${reloadTrigger})`);
        const profiles = await fetchCompanyUsers(company);
        console.log(`Retrieved ${profiles.length} user profiles`);
        setUserProfiles(profiles);
      }
    };
    
    loadCompanyUsers();
  }, [company, reloadTrigger, fetchCompanyUsers]);
  
  // Ensure all users are loaded
  useEffect(() => {
    if (!loadingUsers && allUsers.length === 0) {
      console.log("Loading users in CollaboratorsManagement");
      fetchUsers();
    }
  }, [allUsers.length, loadingUsers, fetchUsers]);
  
  // Listen for company selection events and reload data
  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("CollaboratorsManagement: Company change event detected");
      setReloadTrigger(prev => prev + 1);
    };
    
    const handleSettingsCompanyChanged = (event: CustomEvent<{company: Company}>) => {
      console.log("Settings company changed event detected:", event.detail.company.nome);
      setReloadTrigger(prev => prev + 1);
    };
    
    window.addEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
    window.addEventListener('company-relation-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
      window.removeEventListener('company-relation-changed', handleCompanyChange);
    };
  }, [setReloadTrigger]);

  console.log({
    isLoading,
    loadingUsers,
    companyUsersCount: companyUsers.length,
    filteredCompanyUsersCount: filteredCompanyUsers.length,
    allUsersCount: allUsers.length,
    initialFetchDone: initialFetchDone.current
  });

  return {
    isLoading,
    loadingUsers,
    allUsers,
    companyUsers,
    filteredCompanyUsers,
    availableUsers,
    userRoles,
    searchTerm,
    reloadTrigger,
    setSearchTerm,
    addUserToCompany,
    removeUserFromCompany,
    setReloadTrigger
  };
};
