
import { useState, useRef } from 'react';
import { UserProfile } from "@/hooks/useUsers";

export const useCollaboratorState = () => {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(false);
    initialFetchDone.current = false;
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
