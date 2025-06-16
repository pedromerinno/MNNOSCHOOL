
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
  const [lastCompanyId, setLastCompanyId] = useState<string | null>(null);
  
  // Get state management and actions
  const {
    isLoading,
    companyUsers,
    searchTerm,
    userRoles,
    reloadTrigger,
    error,
    initialFetchDone,
    setIsLoading,
    setCompanyUsers,
    setUserRoles,
    setSearchTerm,
    setReloadTrigger,
    setError,
    resetState
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

  // Reset state when company changes
  useEffect(() => {
    if (company?.id !== lastCompanyId) {
      console.log(`Company changed from ${lastCompanyId} to ${company?.id}`);
      resetState();
      setLastCompanyId(company?.id || null);
    }
  }, [company?.id, lastCompanyId, resetState]);

  // Load data when component mounts and when company or reload trigger changes
  useEffect(() => {
    const loadCompanyUsers = async () => {
      if (!company || !company.id) {
        console.log("No company selected, resetting loading state");
        setIsLoading(false);
        setError(null);
        setCompanyUsers([]);
        return;
      }
      
      // Skip if already loaded for this company
      if (initialFetchDone.current && company.id === lastCompanyId) {
        console.log("Data already loaded for this company");
        setIsLoading(false);
        return;
      }
      
      console.log(`Loading company users for ${company.nome}`);
      try {
        await fetchCompanyUsers(company);
      } catch (error: any) {
        console.error('Error loading company users:', error);
        setError("Falha ao carregar colaboradores. Por favor, tente novamente.");
      }
    };
    
    loadCompanyUsers();
  }, [company, reloadTrigger, fetchCompanyUsers, setIsLoading, setCompanyUsers, setError, initialFetchDone, lastCompanyId]);
  
  // Ensure all users are loaded (mas com prioridade menor)
  useEffect(() => {
    if (!loadingUsers && allUsers.length === 0) {
      console.log("Loading users in CollaboratorsManagement");
      // Delay para não competir com o carregamento dos colaboradores
      setTimeout(() => {
        fetchUsers();
      }, 500);
    }
  }, [allUsers.length, loadingUsers, fetchUsers]);
  
  // Listen for company selection events and reload data
  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("CollaboratorsManagement: Company change event detected");
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
