
import { useEffect, useCallback, useState } from 'react';
import { Company } from "@/types/company";
import { useUsers } from "@/hooks/useUsers";
import { useCollaboratorState } from './useCollaboratorState';
import { useFetchCompanyUsers } from './useFetchCompanyUsers';
import { useCompanyUserRelationship } from './useCompanyUserRelationship';
import { useFilterUsers } from './useFilterUsers';
import { CollaboratorData } from './types';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

export const useCollaboratorManagement = (company: Company | null): CollaboratorData => {
  const { users: allUsers, loading: loadingUsers, fetchUsers } = useUsers();
  const [retryAttempt, setRetryAttempt] = useState(0);
  
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

  // Function to retry fetch with backoff
  const retryFetchWithBackoff = useCallback(async (fn: () => Promise<any>) => {
    try {
      return await fn();
    } catch (error) {
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retry attempt ${retryAttempt + 1} of ${MAX_RETRY_ATTEMPTS}`);
        setRetryAttempt(prev => prev + 1);
        
        // Implement exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryAttempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try again
        return fn();
      }
      throw error;
    }
  }, [retryAttempt]);

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

  // Reset retry counter when company changes
  useEffect(() => {
    setRetryAttempt(0);
  }, [company?.id]);

  // Load data when component mounts and when company or reload trigger changes
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
      
      console.log(`Loading company users for ${company.nome} (${reloadTrigger})`);
      try {
        setIsLoading(true);
        setError(null);
        
        // Use retry mechanism
        await retryFetchWithBackoff(() => fetchCompanyUsers(company));
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error loading company users:', error);
        setError("Falha ao carregar colaboradores. Por favor, tente novamente.");
        setIsLoading(false);
      }
    };
    
    loadCompanyUsers();
  }, [company, reloadTrigger, fetchCompanyUsers, setIsLoading, setCompanyUsers, setError, initialFetchDone, retryFetchWithBackoff]);
  
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
      setRetryAttempt(0); // Reset retry counter on company change events
      setReloadTrigger(prev => prev + 1);
    };
    
    window.addEventListener('company-relation-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyChange);
    };
  }, [setReloadTrigger]);

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
