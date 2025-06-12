
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
    initialFetchDone,
    error,
    setError
  } = useCollaboratorState();

  // Get company users fetching functionality
  const { fetchCompanyUsers } = useFetchCompanyUsers(
    setCompanyUsers,
    setIsLoading,
    setUserRoles,
    initialFetchDone,
    setError
  );

  // Get user-company relationship management
  const { addUserToCompany: addUser, removeUserFromCompany: removeUser } = 
    useCompanyUserRelationship(setCompanyUsers, setUserRoles, setReloadTrigger);

  // Get filtered users
  const { availableUsers, filteredCompanyUsers } = 
    useFilterUsers(allUsers, companyUsers, searchTerm);

  // Wrapper functions to include company
  const addUserToCompany = useCallback(async (userId: string): Promise<boolean | void> => {
    if (!company) {
      console.error('Cannot add user - no company selected');
      return Promise.resolve(false);
    }
    return addUser(userId, company);
  }, [addUser, company]);

  const removeUserFromCompany = useCallback(async (userId: string): Promise<boolean | void> => {
    if (!company) {
      console.error('Cannot remove user - no company selected');
      return Promise.resolve(false);
    }
    return removeUser(userId, company);
  }, [removeUser, company]);

  // Single effect to load company users - simplified logic
  useEffect(() => {
    const loadCompanyUsers = async () => {
      if (!company || !company.id) {
        console.log("No company selected, resetting loading state");
        setIsLoading(false);
        setError(null);
        setCompanyUsers([]);
        initialFetchDone.current = true;
        return;
      }
      
      // Prevent double loading by checking if we're already loading
      if (isLoading && initialFetchDone.current) {
        console.log("Already loading, skipping duplicate request");
        return;
      }
      
      console.log(`Loading company users for ${company.nome} (trigger: ${reloadTrigger})`);
      try {
        setIsLoading(true);
        setError(null);
        
        await fetchCompanyUsers(company);
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error loading company users:', error);
        setError("Falha ao carregar colaboradores. Por favor, tente novamente.");
        setIsLoading(false);
      }
    };
    
    loadCompanyUsers();
  }, [company?.id, reloadTrigger, fetchCompanyUsers, setIsLoading, setCompanyUsers, setError, initialFetchDone, isLoading]);
  
  // Ensure all users are loaded
  useEffect(() => {
    if (!loadingUsers && allUsers.length === 0) {
      console.log("Loading users in CollaboratorsManagement");
      fetchUsers();
    }
  }, [allUsers.length, loadingUsers, fetchUsers]);

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
    setReloadTrigger,
    error
  };
};
