
import { useState, useRef } from 'react';
import { CollaboratorState } from './types';
import { UserProfile } from '@/hooks/useUsers';

export const useCollaboratorState = (): CollaboratorState & {
  setIsLoading: (value: boolean) => void;
  setCompanyUsers: (users: UserProfile[]) => void;
  setUserRoles: (roles: Record<string, string>) => void;
  setSearchTerm: (term: string) => void;
  setReloadTrigger: (value: React.SetStateAction<number>) => void;
  setError: (error: string | null) => void;
  initialFetchDone: React.MutableRefObject<boolean>;
} => {
  const [isLoading, setIsLoading] = useState(true);
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  return {
    isLoading,
    companyUsers,
    searchTerm,
    userRoles,
    reloadTrigger,
    error,
    setIsLoading,
    setCompanyUsers,
    setUserRoles,
    setSearchTerm,
    setReloadTrigger,
    setError,
    initialFetchDone
  };
};
