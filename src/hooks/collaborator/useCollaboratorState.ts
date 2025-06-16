
import { useState, useRef } from 'react';
import { UserProfile } from "@/hooks/useUsers";

export const useCollaboratorState = () => {
  const [isLoading, setIsLoading] = useState(false); // Começar como false, não true
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  // Reset state when company changes
  const resetState = () => {
    console.log("[useCollaboratorState] Resetting state");
    setCompanyUsers([]);
    setUserRoles({});
    setError(null);
    setIsLoading(false); // Importante resetar loading também
    initialFetchDone.current = false;
    
    // Limpar cache relacionado ao colaboradores quando trocar de empresa
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('company-users-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  return {
    isLoading,
    companyUsers,
    searchTerm,
    userRoles,
    reloadTrigger,
    error,
    initialFetchDone,
    setIsLoading,
    setCompanyUsers,
    setSearchTerm,
    setUserRoles,
    setReloadTrigger,
    setError,
    resetState
  };
};
