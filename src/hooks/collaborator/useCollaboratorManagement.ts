
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
  const addUserToCompany = useCallback((userId: string): Promise<boolean | void> => {
    if (!company) {
      console.error('Cannot add user - no company selected');
      return Promise.resolve();
    }
    return addUser(userId, company);
  }, [addUser, company]);

  const removeUserFromCompany = useCallback((userId: string): Promise<boolean | void> => {
    if (!company) {
      console.error('Cannot remove user - no company selected');
      return Promise.resolve();
    }
    return removeUser(userId, company);
  }, [removeUser, company]);

  // Load data when component mounts and when company or reload trigger changes
  useEffect(() => {
    const loadCompanyUsers = async () => {
      if (company && company.id) {
        console.log(`Loading company users for ${company.nome} (${reloadTrigger})`);
        try {
          const profiles = await fetchCompanyUsers(company);
          console.log(`Retrieved ${profiles?.length || 0} user profiles`);
          setUserProfiles(profiles || []);
          // Set loading to false even if there are no profiles
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading company users:', error);
          setIsLoading(false); // Make sure to set loading to false on error
        }
      } else {
        // No company selected, ensure loading state is reset
        setIsLoading(false);
      }
    };
    
    loadCompanyUsers();
  }, [company, reloadTrigger, fetchCompanyUsers, setIsLoading]);
  
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

  // Debug output for troubleshooting
  useEffect(() => {
    console.log({
      isLoading,
      loadingUsers,
      companyUsersCount: companyUsers.length,
      filteredCompanyUsersCount: filteredCompanyUsers.length,
      allUsersCount: allUsers.length,
      initialFetchDone: initialFetchDone.current,
      hasCompany: !!company
    });
  }, [isLoading, loadingUsers, companyUsers.length, filteredCompanyUsers.length, allUsers.length, initialFetchDone, company]);

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
