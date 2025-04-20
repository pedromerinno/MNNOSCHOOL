
import { useState, useEffect, useCallback } from "react";
import { Company } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyState } from "./useCompanyState";
import { useCompanyFetching } from "./useCompanyFetching";
import { useCompanyModification } from "./useCompanyModification";
import { useCompanySelection } from "./useCompanySelection";
import { useCompanyEvents } from "./useCompanyEvents";
import { UseCompaniesReturn } from "./types";

export const useCompanies = (): UseCompaniesReturn => {
  const { user } = useAuth();
  
  const {
    // Loading states
    isLoading,
    setIsLoading,
    
    // Company states
    companies,
    setCompanies,
    userCompanies,
    setUserCompanies,
    selectedCompany,
    setSelectedCompany,
    
    // Error and fetch states
    error,
    setError,
    resetError,
    fetchCount,
    incrementFetchCount,
    initialFetchDone
  } = useCompanyState();
  
  // Company fetching operations
  const {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  } = useCompanyFetching({
    userCompanies,
    setUserCompanies,
    setSelectedCompany,
    setIsLoading,
    setError,
    incrementFetchCount
  });

  // Company modification operations
  const {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany: deleteCompanyBase,
    selectCompany: selectCompanyBase
  } = useCompanyModification({
    companies,
    userCompanies,
    setCompanies,
    setSelectedCompany,
    setIsLoading,
    setError
  });
  
  // Wrap deleteCompany to ensure it returns a boolean
  const deleteCompany = async (companyId: string): Promise<boolean> => {
    try {
      await deleteCompanyBase(companyId);
      return true;
    } catch (err) {
      console.error("Error in deleteCompany wrapper:", err);
      return false;
    }
  };
  
  // Company selection operations
  const {
    getStoredCompanyId,
    getStoredCompany,
    persistCompanySelection
  } = useCompanySelection({
    setSelectedCompany
  });
  
  // Wrapper to select a company if the user has companies
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (isLoading) {
      console.log("Not selecting company while loading");
      return;
    }
    
    selectCompanyBase(userId, company);
  }, [selectCompanyBase, isLoading]);
  
  // Register event listeners
  useCompanyEvents({
    forceGetUserCompanies
  });
  
  // Initial fetch of companies data when user is available
  useEffect(() => {
    const initializeCompanies = async () => {
      if (!user?.id || initialFetchDone.current) return;
      
      try {
        console.log("Initializing companies for user:", user.id);
        
        // First check if there's a stored company
        const foundStoredCompany = getStoredCompany();
        if (foundStoredCompany) {
          console.log("Found stored company selection:", foundStoredCompany.nome);
        }
        
        // Fetch companies for the user
        resetError();
        await getUserCompanies(user.id);
        
        initialFetchDone.current = true;
        
        // If there's a stored company ID, try to restore selected company
        if (foundStoredCompany) {
          console.log("Restoring stored company selection:", foundStoredCompany.nome);
          persistCompanySelection(foundStoredCompany);
        } else if (userCompanies.length > 0) {
          // If no stored company, select the first one from the list
          console.log("No company selected, selecting first company:", userCompanies[0].nome);
          persistCompanySelection(userCompanies[0]);
        }
      } catch (err) {
        console.error("Error initializing companies:", err);
        setError(err instanceof Error ? err : new Error("Failed to initialize companies"));
      }
    };
    
    initializeCompanies();
  }, [
    user?.id, 
    getUserCompanies, 
    userCompanies, 
    initialFetchDone, 
    getStoredCompanyId, 
    getStoredCompany, 
    persistCompanySelection,
    resetError,
    setError
  ]);
  
  // If user changes, we should reset state and refetch
  useEffect(() => {
    if (user === null) {
      setUserCompanies([]);
      setSelectedCompany(null);
      initialFetchDone.current = false;
    }
  }, [user, setUserCompanies, setSelectedCompany]);
  
  return {
    // Basic state
    companies,
    userCompanies,
    selectedCompany,
    isLoading,
    error,
    fetchCount,
    user, // Explicitly including the user in the return object
    
    // Fetch operations
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    
    // Modification operations
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    selectCompany,
    
    // Selection operations
    getStoredCompanyId,
    getStoredCompany
  };
};

export * from './types/createTypes';
export * from './types/fetchTypes';
